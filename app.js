const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieNametoPascalCase = (dbObject) => {
  return { movieName: dbObject.movie_name };
};
//API 1 return all movie name from the table

app.get("/movies/", async (request, response) => {
  const getAllMovieQuery = `
    SELECT movie_name FROM movie;`;
  const moviesArray = await db.all(getAllMovieQuery);
  response.send(
    moviesArray.map((moviename) => convertMovieNametoPascalCase(moviename))
  );
});

//API 2 Creates a new movie in the movie table. `movie_id` is auto-incremented

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
   INSERT INTO 
   movie 
    (director_id, movie_name, lead_actor} 
    VALUES
        (${directorId},'${movieName}','${leadActor}');`;

  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//API 3 Returns a movie based on the movie ID

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie where movie_id= ${movieId};`;
  const movie = await db.get(getMovieQuery);
  console.log(movieId);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4 Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const movieId = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
   UPDATE 
        movie 
    SET
        director_id = ${directorId}, 
        movie_name = '${movieName}', 
        lead_actor= '${leadActor}' 
    WHERE
        movie_id= ${movieId};`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5 Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id= ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6 Returns a list of all directors in the director table

const convertDirectorDetailstoPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
  app.get("/directors/", async (request, response) => {
    const getDirectorQuery = `
    SELECT * FROM director;`;
    const moviesArray = await db.all(getDirectorQuery);
    response.send(
      moviesArray.map((director) =>
        convertDirectorDetailstoPascalCase(director)
      )
    );
  });
};

//API 7 Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT 
        movie_name 
    FROM 
        director INNER JOIN movie ON
        director.director_id = movie.director_id
    WHERE director_id= ${directorId};`;
  const movie = await db.get(getDirectorQuery);
  console.log(directorId);
  response.send(convertDbObjectToResponseObject(movie));
});

module.exports = app;

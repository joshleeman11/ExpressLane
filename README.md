# ExpressLane

This is a full stack application that uses real-time MTA data to navigate the New York City subway system.

## Backend

ExpressLane uses Flask to interact with the MTA API and query a SQLite database.

## Frontend

ExpressLane uses React with TypeScript.

## How to use this project

You should clone the repository and create a virtual environment in your terminal. 

1. On a Mac, if it is your first time installing the project, use `python3 -m venv .venv` on the command line to create a virtual environment. If you already have the virtual environment installed, skip this step.
2. Run `source .venv/bin/activate` to activate the virtual environment. This ensures you are using the version of the dependencies this project was built with.
3.  Run `pip install -r requirements.txt` on the command line to install the requirements.
4.  Type `flask run` on the command line to spin up the server.
5.  Next, open a new terminal. Run `npm install` to install the front end dependencies.
6.  Run `npm start` to spin up the front end. You can now run the project.

## Contributing to the project
1. Use `git fetch` on the command line. This retrieves all the remote work from the remote repository.
2. Create a new branch using `git checkout -b <new branch name>`, using a name that describes the work you are doing on your branch. This clones whatever branch you are currently on. 
3. Begin developing on your branch, committing often. Don't forget to push your changes to the remote repository using `git push`!
4. When you think you're ready for production, perform a pull request on your branch.

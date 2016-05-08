# Splash Art Puzzles

microtony's entry for the Riot Games API Challenge 2016

[Play now!](http://sap-microtony.rhcloud.com/)

## How to play

Solve the sliding puzzle by clicking on tiles adjacent to the empty space. Unlock new skins and the next difficulty for the champion by solving the highest unlocked level. Alternatively, you can unlock skins and levels with the Champion Mastery levels of your League of Legends account. Verification can be done by adding a code to one of the mastery pages.

There are 8 different levels. Guests starts with Level 0 for every champion. Levels 6 and 7 can only be unlocked by solving level 5 and 6 respectively until Champion Mastery levels 6 and 7 are introduced. 

* Level 0: 3 x 2
* Level 1: 4 x 3
* Level 2: 5 x 3
* Level 3: 6 x 4
* Level 4: 7 x 4
* Level 5: 8 x 5
* Level 6: 9 x 5
* Level 7: 10 x 6

## Development

### Frontend

Main technologies used: CSS (Bootstrap framework) and Javascript.

There is only one static HTML page. The Sliding Puzzle Game is written in Javascript. First of all, the tiles are randomly shuffled. Not all arrangements are solvable (50/50 chance), so puzzles are regenerated until a solvable one is obtained. This article [Solvability of the Tiles Game](https://www.cs.bham.ac.uk/~mdr/teaching/modules04/java2/TilesSolvability.html) explains the conditions of a solvable puzzle.

To render the puzzle, each tile has an HTML data attribute which stores the current position. SCSS is used to generate the necessary styles for placing the tiles into the correct positions according to the position data attribute and level. [Compass.app by KKBOX](http://compass.kkbox.com/) is used to generate and minify the CSS.

The game is optimized for mobile devices.

### Server

Main technologies used: Node.js + Express + MongoDB

The server exposes API endpoints for retrieving users' info (levels and League of Legends account connect status), and to unlock levels.

To store user progress, a new user is created when a guest solves the first puzzle. The ID of the user is then saved into the session. Both users and sessions are stored in a MongoDB database. Levels that are unlocked by solving puzzles are stored in a subdocument called `manual`, while levels that come from the user's Champion Mastery level are stored in the `account` subdocument. 

A sample `user` document is shown below:

```javascript
{
    "__v" : 13,
    "_id" : ObjectId("572c40893c7c58c8351f33d0"),
    "account" : [ 
        {
            "champion" : "Darius",
            "level" : 1,
            "_id" : ObjectId("572c8fed88c214804afdb564")
        }, 
        {
            "champion" : "Zilean",
            "level" : 1,
            "_id" : ObjectId("572c8fed88c214804afdb565")
        }
    ],
    "connected" : true,
    "manual" : [ 
        {
            "champion" : "Ahri",
            "level" : 5,
            "_id" : ObjectId("572c8fed88c214804afdb55d")
        }, 
        {
            "champion" : "Fizz",
            "level" : 2,
            "_id" : ObjectId("572c8fed88c214804afdb55e")
        }, 
        {
            "champion" : "Ezreal",
            "level" : 7,
            "_id" : ObjectId("572c8fed88c214804afdb55f")
        },
        {
            "champion" : "Lucian",
            "level" : 1,
            "_id" : ObjectId("572c902588c214804afdb568")
        }
    ],
    "name" : "microtony",
    "playerId" : 20545469,
    "region" : "NA"
}
```

## Deployment

You may use your favorite IaaS or PaaS such as Heroku and Openshift. Choose a Node.js gear and add MongoDB to it. Checkout and push the code. There are three additional environment variables that you need to configure:

* `API_KEY`: Your Riot Games API key
* `UNLOCK_SECRET`: A secret (long random string) used for generating the code for verifying LoL account.
* `SAP_SECRET`: A secret used for encrypting session cookies.

Heroku: `heroku config:set <Variable>=<Value>`

Openshift: `rhc env set <Variable>=<Value> -a <App_Name>`

## Discussion

1. There is no anti-cheat mechanism, meaning that users can modify the DOM with developer tools to unlock skins and levels. 
2. Splash arts currently available via Data Dragon are right-aligned. Therefore, I made the bottom-left corner the empty space, as opposed to the usual bottom-right corner. Repositioning of the empty space can be reconsidered when the new centered splash arts becomes available.

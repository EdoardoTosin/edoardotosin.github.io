---
title: xTetris Game - Readme
description: Variant of the famous game Tetris for Linux
feed: show
date: 05-09-2022
---

This is a variant of the famous video game Tetris written in C (standard C89) for Linux.

## Gameplay
* Goal: Put your organizational skills and endurance to the test by clearing as many lines as possible.
* Clear lines: Maneuver the falling Tetriminos to fit them together within the Matrix. To clear a line, fill every square within a single row.
* Score points: Earn points by clearing lines. Clear multiple lines at once to increase your scoring opportunities.
* Ghost piece: Use the Ghost Piece to determine the best fit for the falling Tetrimino. This helpful guide appears directly below the falling Tetrimino and displays possible placements.
* Next queue: Preview the upcoming Tetrimino in the Next Queue to plan ahead and increase your scoring opportunities.
* Hold queue: Store a falling Tetrimino in the Hold Queue for later use.
* Game over: Stack the Tetriminos too high and the game is over!

Source: [tetris.123-games.org](https://tetris.123-games.org/tut.html)

## Controls
- `W`: Rotate the tetromino 90° counter-clockwise.
- `S`: Rotate the tetromino 90° clockwise.
- `A`: Move the tetromino to the left.
- `D`: Move the tetromino to the right.
- `Spacebar`: Accelerate tetromino falling.
- `Enter`: Confirm.
- `Esc`: Go back.

## Requirements
- [Git](https://git-scm.com/).
- [CMake](https://cmake.org/) (version equal or greater than 3.21).
- (Optional) Set one of the [Nerd fonts](https://github.com/ryanoasis/nerd-fonts) in your terminal for better display the special characters printed by the game.

## Compile
Run the following commands on terminal:
``` bash
$ git clone https://github.com/EdoardoTosin/xTetris-Game.git
$ cd xTetris-Game
$ ./build.sh
```

## Launch
Run the following command on terminal:
``` bash
$ ./run.sh
```

## Documentation

Doxygen documentation of the project is available [here](https://edoardotosin.github.io/xTetris-Game/).

## License

Copyright (c) 2021 [Edoardo Tosin](https://github.com/EdoardoTosin)

This software is released under the terms of the GNU General Public License v3.0. See the [LICENSE](https://github.com/EdoardoTosin/xTetris-Game/tree/main/LICENSE) file for further information.

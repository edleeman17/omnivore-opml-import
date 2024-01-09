# Omnivore OPML Import

Omnivore OPML Import is a simple script to import OPML files into Omnivore using their GraphQL API.

## Features
- Import multiple OPML (XML) files into Omnivore
- Run in Docker or locally

## Desired Features
- Label feeds based on OPML grouping

## Installation & Usage
1. Clone this repository
2. Copy OPML files into `./import` directory
3. Add [Omnivore API key](https://omnivore.app/settings/api) to `.env` file (copy example from `.env.sample`)
4. Build docker image: `docker build -t omnivore-opml-import .`
5. Run docker image: `docker run -it --rm omnivore-opml-import`

## Developing Locally
1. Clone this repository
2. Use `.devcontainer` to develop locally in VSCode as this will install all required dependencies
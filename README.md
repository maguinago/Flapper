# Flapper

A browser-based homage to the classic tap-to-fly phone game. Guide the bird through endless pipes, chase your best score, and restart instantly after a crash.

## Install

Flapper is a static browser game, so there is no package manager install or build step. You only need the project files and a local static file server.

### Option 1: Clone with Git

```bash
git clone <repository-url>
cd Flapper
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/> in your browser.

### Option 2: Download as a ZIP

1. Download and unzip the project.
2. Open a terminal in the unzipped `Flapper` folder.
3. Run:

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/> in your browser.

## Play locally

After installing/downloading the files, serve the repository with any static file server and open the printed local URL.

```bash
python3 -m http.server 8000
```

## Phone support

Yes. Flapper is designed to run in modern mobile browsers as a static web app. On a phone:

1. Start the local server on your computer with `python3 -m http.server 8000`.
2. Open the game from your phone using the computer's local network address, for example `http://192.168.1.25:8000/`.
3. Tap the canvas or the **Flap** button to play.

If the phone cannot connect, make sure both devices are on the same Wi-Fi network and that your firewall allows inbound connections to port `8000`.

## Controls

- Click or tap the game canvas to flap.
- Press <kbd>Space</kbd> or <kbd>Arrow Up</kbd> to flap.
- Use the on-screen **Flap** and **Restart** buttons on touch devices.

## Features

- Responsive portrait arcade layout.
- Animated canvas rendering with sky, clouds, pipes, ground, and bird sprites.
- Collision detection, scoring, and persistent best score via `localStorage`.
- Keyboard, mouse, and touch-friendly controls.

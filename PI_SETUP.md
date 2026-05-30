# Raspberry Pi 5 Setup Guide

This guide sets up the Tayseer frontend on the Raspberry Pi 5. It is written for someone who has not used a Raspberry Pi before. Follow every step in order.

The Pi runs the Next.js frontend only. The backend runs on the MacBook and the Pi talks to it over the local network.

---

## What You Need

- Raspberry Pi 5 (8GB RAM)
- MicroSD card (32GB or larger, Class 10 or faster)
- MicroSD card reader for your laptop
- Power supply (USB-C, 27W recommended for Pi 5)
- HDMI cable and monitor (for first setup only)
- USB keyboard and mouse (for first setup only)
- Network connection (the Pi must be on the same WiFi or Ethernet as the MacBook)

---

## Part 1: Flash the Operating System

1. Download the Raspberry Pi Imager from `https://www.raspberrypi.com/software/` and install it on your laptop.
2. Insert the MicroSD card into your laptop.
3. Open Raspberry Pi Imager.
4. Click "Choose Device" and select "Raspberry Pi 5".
5. Click "Choose OS" and select "Raspberry Pi OS (64-bit)" under the Raspberry Pi OS section.
6. Click "Choose Storage" and select your MicroSD card. Double check it is the correct drive.
7. Click the gear icon (or press Ctrl+Shift+X) to open the Advanced Options panel.
8. Set a hostname such as `tayseer-pi`.
9. Enable SSH and set a username and password. Write them down.
10. Configure the WiFi if you will connect wirelessly. Enter the network name and password.
11. Click "Save" then click "Write". Confirm when prompted.
12. When writing is complete, eject the card safely.

---

## Part 2: First Boot

13. Insert the MicroSD card into the Pi.
14. Connect the HDMI cable to the Pi's HDMI port (use port 0, the one closer to the USB-C power port).
15. Connect the keyboard and mouse.
16. Connect the power supply. The Pi will boot automatically.
17. Wait for the desktop to appear. This may take up to 2 minutes on first boot.
18. Follow the on-screen setup wizard to set locale and timezone. Skip anything you are unsure about.
19. Open a terminal window by clicking the terminal icon in the taskbar.

---

## Part 3: Find the Pi's IP Address

20. In the terminal type:

    ```
    hostname -I
    ```

    Write down the first IP address shown. It will look like `10.42.200.XX`. You will need this to SSH in from your laptop.

---

## Part 4: Install Node.js

21. In the terminal on the Pi, run the following commands one at a time. Wait for each to finish before typing the next.

    ```
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    ```

    ```
    sudo apt-get install -y nodejs
    ```

    ```
    node --version
    ```

    You should see a version number starting with `v20`. If you see an error, repeat the install commands.

22. Confirm npm is also installed:

    ```
    npm --version
    ```

---

## Part 5: Get the Project Code

23. Install git if it is not already present:

    ```
    sudo apt-get install -y git
    ```

24. Clone the project repository. Replace `YOUR_GITHUB_URL` with the actual URL:

    ```
    git clone YOUR_GITHUB_URL /home/pi/tayseer
    ```

25. Navigate into the project folder:

    ```
    cd /home/pi/tayseer
    ```

---

## Part 6: Configure the Frontend Environment

26. Navigate into the frontend folder:

    ```
    cd /home/pi/tayseer/frontend
    ```

27. Create the environment file:

    ```
    nano .env.local
    ```

28. In the editor type the following line, replacing `MACBOOK_IP` with the MacBook's actual IP address on the local network (for example `10.42.200.53`):

    ```
    NEXT_PUBLIC_API_URL=http://MACBOOK_IP:8000
    ```

29. Press Ctrl+X, then Y, then Enter to save and exit.

---

## Part 7: Install Dependencies and Build

30. Install Node.js dependencies. This may take 5 to 10 minutes on the Pi:

    ```
    npm install
    ```

31. Build the production frontend:

    ```
    npm run build
    ```

    This may take 10 to 15 minutes on the Pi. Wait for the message "Compiled successfully" before continuing.

32. Copy the static assets into the standalone output folder:

    ```
    cp -r public .next/standalone/
    cp -r .next/static .next/standalone/.next/static
    ```

---

## Part 8: Start the Frontend

33. Start the production frontend on port 3001:

    ```
    PORT=3001 node .next/standalone/server.js
    ```

34. Open a browser on any device on the same network and go to:

    ```
    http://PI_IP_ADDRESS:3001/citizen
    ```

    Replace `PI_IP_ADDRESS` with the IP address you noted in step 20. You should see the Tayseer citizen portal.

---

## Part 9: Auto-Start on Boot (Systemd Service)

So the frontend starts automatically when the Pi is powered on:

35. Create a systemd service file:

    ```
    sudo nano /etc/systemd/system/tayseer-frontend.service
    ```

36. Paste the following content. Replace `pi` with your Pi username if different:

    ```
    [Unit]
    Description=Tayseer Frontend
    After=network.target

    [Service]
    Type=simple
    User=pi
    WorkingDirectory=/home/pi/tayseer/frontend
    ExecStart=/usr/bin/node /home/pi/tayseer/frontend/.next/standalone/server.js
    Environment=PORT=3001
    Restart=on-failure
    RestartSec=5

    [Install]
    WantedBy=multi-user.target
    ```

37. Press Ctrl+X, then Y, then Enter to save.

38. Enable and start the service:

    ```
    sudo systemctl daemon-reload
    sudo systemctl enable tayseer-frontend
    sudo systemctl start tayseer-frontend
    ```

39. Confirm it is running:

    ```
    sudo systemctl status tayseer-frontend
    ```

    You should see `Active: active (running)` in green.

40. Reboot the Pi to confirm auto-start works:

    ```
    sudo reboot
    ```

41. After reboot, wait 30 seconds then open `http://PI_IP_ADDRESS:3001/citizen` in a browser. The portal should load without any manual action.

---

## Troubleshooting

If the frontend does not load, check the service log:

```
sudo journalctl -u tayseer-frontend -n 50
```

If you see `ECONNREFUSED` on API calls, the MacBook backend is not reachable. Confirm the MacBook is running `docker-compose up -d` and that both devices are on the same network.

If the build fails with an out of memory error, increase the Node.js heap size before building:

```
NODE_OPTIONS=--max-old-space-size=2048 npm run build
```

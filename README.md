HitchHiker
---

To install: 
- download the repository as a zip file (or clone it)
- unzip it to somewhere you can find on your computer. Leave the HitchHiker-master folder intact
- Open up Google Chrome and type [chrome://extensions](chrome://extensions) into the address bar
- Click the 'Developer Mode' toggle in the upper right corner
- Click the 'Load Unpacked' button that appears after you turn on developer mode
- Load in the 'HitchHiker-master' folder
- Turn on the extension
- Visit any new website
- You should see a hitchhiking thumb icon in the upper right corner of your browser. Click it.
- If you are going to be in the audience, click audience then select the room your guide has created.

To test:
- Install a [second version of chrome](https://www.google.com/chrome/canary/)
- Follow the steps above for the new version of chrome
- Start a hitchhiker session with one browser as guide and one as audience
- Test out actions on the guide side and see the results on the audience side

To add your own functionality:
- Add a javascript file (.js) to the src/user_created folder. The name of the javascript file must be the same name you use as the room name for your performance/tour. When these names are the same, the script will be loaded as a content script on every page you visit.
- To run specific functions from your added script, click the thumb icon and write the name of the function under 'User-Created Content'
- Press enter or click the 'Run' button to run the function
- You can pass up to one parameter to the function, which will be a string of everything following the first space
    - For example: typing 'addH1 wow this is fun' would run 'addH1("wow this is fun")'
- You can also run external functions by using the shift+space console and starting with "f "
    - For example: typing into the shift+space console "f addH1 nacho cheese" would run 'addH1("nacho cheese")'
- When your script is ready for other people to use, you can send it to Todd or put in a pull request here
    - It is intentionally difficult to directly run code from your computer on other connected computers because of the many malicious uses of such a set up. For the time-being, Todd will be personally checking all code before it gets bundled with the project

#Questackular!
![Badge of Honor](https://img.shields.io/badge/Built%20at-Fullstack-green.svg?style=flat-square)
> A chrome extension and web application to help educators make reading more fun for their students.

## Table of Contents

- [Examples](#examples)
- [Extension Installation and Usage](#extension-installation-and-usage)
- [Roadmap](#roadmap)
- [Contributors](#contributors)
- [License](#license)

## Examples
### Demo

See a live version of the app [here](https://questackular.herokuapp.com).

### Screenshots

#### Web Application
![Web application](http://i.imgur.com/rGtbTRm.png)
#### Highlighting and Saving in Chrome Extension
![Highlighting](http://i.imgur.com/UEsAcGO.png)
#### Link Library
![Link Library](http://i.imgur.com/rqCvSXp.png)
#### Playing a Quest
![Playing a Quest](http://i.giphy.com/3o85xu6MPFvoOmUMP6.gif)

## Extension Installation and Usage

1. Clone the repository

	```bash
	git clone https://github.com/smuenzinger/questackular.git
	```
2.	Build extension files

	```bash
	gulp build	   # compiles and builds extension files
	```
3.	Install the Chrome extension
	Go to `chrome://extensions/` in your Chrome browser, drag the 'Extension' folder into the list, and enable the extension.

4.	You can log in via Google from [our web application](https://questackular.herokuapp.com)

5.	You can join any quest and start playing in the extension.

6.	You may save URLs and snippets for a future quest. 

	Go to any webpage, highlight any important text that you would like to save, turn on selection mode in the extension and click "save content". You will find your saved links in the Library in the web application.




### Roadmap

#### Features

-	Highlights and saves any URL and important passages to link library
-	Chrome Extension launches readings in current tab 
-	Upload an image in quest creation
-	Invite participants by email
-	Create quests and view interactive D3 focal map
-	Edit quests and quest steps

#### Known bugs

- Highlighting currently can not be disabled through the extension.
- Testing is currently out of date with new model changes.

## Contributors
* __Alice Kindheart__ - [LinkedIn](https://www.linkedin.com/in/alicekindheart) | [GitHub](https://github.com/AliceKindheart)
* __Sarah Muenzinger__ - [LinkedIn](https://www.linkedin.com/in/sarahmuenzinger) | [GitHub](https://github.com/smuenzinger)
* __David Newman__ - [LinkedIn](https://www.linkedin.com/in/newms34) | [GitHub](https://github.com/Newms34)
* __Yvonne Wang__ - [GitHub](https://github.com/sautille)

## License

This projected is licensed under the terms of the [MIT license](http://opensource.org/licenses/MIT)



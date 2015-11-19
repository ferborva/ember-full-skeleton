THIS PROJECTS INITIAL CONFIGURATION
-----------------------------------

Firebase URL: cfmcom.firebaseio.com

Provider:     github

top toolbar
  medium size and less: sidenav with toggle button + config initializer in application.hbs

* User datapoint configuration and firebase user security rules
* Basic user profile view and edit template
* Basic news feed feature




STEPS
-----


1º - Present the use with a simple toolbar (application template)

(all components to be used from Materialize can be found on the website: http://materializecss.com/)

2º - Include the signIn - signOut buttons. Present the user with info about the logged in user (console.log)

3º - Create the dataPoint service: initializer to present user with dataUrls to call:
      --User: profile
              config
              personal data

      --Community data:   news
                          chat

      --AppPublicConfig: ---

    a. Create service:      ember g service datapoint

    b. Create intializer:   ember g initializer datapoint

    c. Create properties and initializer method (see file)

    d. Initialize the dataservice in applicationRoute beforeModel

    e. Pass the userSign in and signOUt methods to the datapoint service

THIS PROJECTS INITIAL CONFIGURATION
-----------------------------------

Firebase URL: cfmcom.firebaseio.com

Provider:     github

top toolbar
  medium size and less: sidenav with toggle button + config initializer in application.hbs

User datapoint configuration and firebase user security rules

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


4º - ADD USER SECURITY RULES to firebase

    {
      "rules": {
        "users": {
          "$uid": {
            ".read": "auth != null && auth.uid == $uid",
            ".write": "auth != null && auth.uid == $uid"
          }
        },
        "community":{
          ".read": "root.child('users').child(auth.uid).exists()"
        },
        "public":{
          ".read": "true",
          ".write": "true"
        }
      }
    }

    These simple rules secure the 'users' node, only to be read or wrote by the owner of the node, 'community' node, only to be read by registered users, and the 'public' node, opendata point.

5º - Included 'MINIMUM PROFILE' data save logic.
    Upon entering the site or when login in, the saved user profile data will be checked:
        if(user_data = empty) -> save the currentUser info.


6º - Create the TOASTING Service!!!

    ember g service toast
    ember g intializer toast

    Creating the service and intializing it. This will inject the toast service into the routes and controllers.


7º - Firebase PRESENCE system. Register user presence (online).

  Extend the datapoint service with a setupPresence method (called when initializing the app or when user Logs in).

8º - 

Iniciar proyecto:
-----------------


ember new FAMEskeleton

cd FAMEskeleton

// Check run

ember server

// ALL OK

Add Materialize and Animate.css:
--------------------------------


Download ANIMATE.CSS:
https://daneden.github.io/animate.css/

Put file into /vendors/animate/animate.css
Add the following to the ember-cli-build.js file, as indicated in the comments:

 app.import('vendor/animate/animate.css');


MATERIALIZE:
       npm install ember-cli-materialize --save-dev

       ember g ember-cli-materialize

       - Accept overwriting the config/environment.js file
       ** You will have a new app.scss which will be compiled into the main css file.


       ADD ICONS:

       Paste the following into the head of the index.html file, after the FAMEskeleton.css import:

        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">



FIREBASE AND torii
------------------


Install emberfire:

  ember install emberfire

  You receive this notice on the console:

  EmberFire has been installed. Please configure your firebase URL in config/environment.js

      ** Two new nodes have been created in the environment.js file: contentSecurityPolicy and firebase

      firebase will take the URL to YOUR-FIREBASE-NAME.firebaseio.com (follow template given)
      replace the current  contentSecurityPolicy node with this

      contentSecurityPolicy: {
        'default-src': "'none'",
        'script-src': "'self' 'unsafe-inline' https://cdn.firebase.com/ *",
        'font-src': "'self' 'unsafe-inline' *",
        'connect-src': "'self' https://auth.firebase.com wss://*.firebaseio.com",
        'img-src': "'self' 'unsafe-inline' *",
        'style-src': "'self' 'unsafe-inline' *",
        'media-src': "'self'",
        'frame-src': "'self' 'unsafe-inline' *"
      }



// Check

ember server

// ALL GOOD


  EMBER torii
  -----------

    ember install torii

    Include the following in the environment.js file, so to name the torii Service that will be made available:

        firebase: 'https://YOUR-FIREBASE-NAME.firebaseio.com/',
        torii: {
          sessionServiceName: 'session'
        }

In order to use Torii, we need to create a app/torii-adapters/application.js
adapter file with the following code:

        Copy
        ----

        import Ember from 'ember';
        import ToriiFirebaseAdapter from 'emberfire/torii-adapters/firebase';
        export default ToriiFirebaseAdapter.extend({
          firebase: Ember.inject.service()
        });




  CREATE AND EXTEND APPLICATION ROUTE - Include the service intialization (fetch) and make
                             Login and Logout available as global actions


        Generate the route with ember-cli:
        ----------------------------------
        ember g route application

        // app/routes/application.js
        import Ember from 'ember';
        export default Ember.Route.extend({
          beforeModel: function() {
            return this.get("session").fetch().catch(function() {});
          },
          actions: {
            signIn: function(provider) {
              this.get("session").open("firebase", { provider: provider}).then(function(data) {
                console.log(data.currentUser);
              });
            },
            signOut: function() {
              this.get("session").close();
            }
          }
        });


        To test, include the following into the application.hbs file:
        --------------------------------------------------------------

          {{#if session.isAuthenticated}}
            Logged in as {{session.currentUser.displayName}}
            <button {{action "signOut"}}>Sign out</button>
            {{outlet}}
          {{else}}
            <button {{action "signIn" "twitter"}}>Sign in with Twitter</button>
          {{/if}}




AUTH WITH USER AND PASSWORD, instead of github, twitter ...

    this.get('session').open('firebase', {
      provider: 'password',
      email: 'test@example.com',
      password: 'password1234'
    });




GITHUB
------

Ember cli already runs 'git init' on your project.
Run:

git status

To see the changes made and the new files added.
Run:

git add .

To add all changes, and finally commit with an initial load message:

git commit -am "[core] - First load to github. Initial scaffold layed out. Only ember-cli version deprecations appear. Hopefully bug will fix soon"

Final check to see if all is alright:

git status

Create new repo.
----------------
Go to your github account. Create new repo, with NO README.md file

  Run:
  ----
  git remote add origin https://github.com/beeva-fernandobordallo/ember-full-skeleton.git

  Pointing to your newly created project.





ENVIRONMENT.JS
---------------


/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    i18n: {
      defaultLocale: 'es'
    },
    modulePrefix: 'cfm-com',
    environment: environment,
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline' https://cdn.firebase.com/ *",
      'font-src': "'self' 'unsafe-inline' *",
      'connect-src': "'self' https://auth.firebase.com wss://*.firebaseio.com",
      'img-src': "'self' 'unsafe-inline' *",
      'style-src': "'self' 'unsafe-inline' *",
      'media-src': "'self'",
      'frame-src': "'self' 'unsafe-inline' *"
    },
    firebase: 'https://cfmcom.firebaseio.com/',
    torii: {
      sessionServiceName: 'session'
    },
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    sassOptions: {
      includePaths: ['bower_components/materialize/sass']
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};

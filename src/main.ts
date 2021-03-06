import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

declare const window;
declare const navigator;

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
};

if (typeof window['cordova'] !== 'undefined') {
  document.addEventListener('deviceready', () => {
    if(window.wkWebView) {
      window.wkWebView.injectCookie('/');
    }
    //For iPhones except iPhones X we would like header to not overlay the status bar
    if (window.device.model !== 'iPhone10,3' && window.device.model !== 'iPhone10,6') {
      window.StatusBar.overlaysWebView(false);
    }

    //Changed definition for window open to use in app browser
    window.open = window.cordova.InAppBrowser.open;

    //Prevent back button to go to unlock screen
    document.addEventListener('backbutton', e => {
      if(navigator && navigator.Backbutton) {
        navigator.Backbutton.goHome();
      }
    }, false);

    window.addEventListener('keyboardDidHide', ()=> {
      if(window.style) {
        window.style.height = '100vh';
      }
    });

    bootstrap();
  }, false);
} else {
  bootstrap();
}

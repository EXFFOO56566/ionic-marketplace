import { Component, OnInit, OnDestroy, AfterViewInit  } from '@angular/core';
import { Platform, NavController, ToastController, IonRouterOutlet, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppMinimize } from '@ionic-native/app-minimize/ngx';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import { Config } from './config';
import { Subscription } from 'rxjs';


declare var wkWebView: any;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})

export class AppComponent{
      private backButtonSubscription: Subscription;

    @ViewChild(IonRouterOutlet, {static: false}) routerOutlet: IonRouterOutlet;
    constructor(public config: Config, public alertController: AlertController, private router: Router, public navCtrl: NavController, public translateService: TranslateService, public platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar, private appMinimize: AppMinimize) {
        this.initializeApp();
    }

    ngAfterViewInit(): void {

        this.translateService.setDefaultLang('en');
        //document.documentElement.setAttribute('dir', 'rtl');

        this.backButtonSubscription = this.platform.backButton.subscribe(() => {
        if (this.router.url === '/tabs/home') {
          //this.backButtonSubscription.unsubscribe();
          //this.presentAlertConfirm();
          navigator['app'].exitApp();
        }
        else{
        this.navCtrl.navigateForward('/tabs/home');
        }
        });
    }


    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();

            document.addEventListener('deviceready', () => {
                wkWebView.injectCookie(this.config.url + '/');
            });

            this.statusBar.backgroundColorByHexString('#ffffff');

            /* Add your translation file in src/assets/i18n/ and set your default language here */
            //this.translateService.setDefaultLang('ar');
            //document.documentElement.setAttribute('dir', 'rtl');

            
            //document.documentElement.setAttribute('dir', 'rtl');

            //this.statusBar.backgroundColorByHexString('#004a91');
            //this.statusBar.backgroundColorByHexString('#ffffff');
            //this.statusBar.styleBlackTranslucent();
            //this.statusBar.styleLightContent();

            //this.minimize();
            /*this.platform.backButton.subscribeWithPriority(0, () => {
               this.appMinimize.minimize();
            });*/

           /* this.platform.backButton.subscribeWithPriority(0, () => {
               //this.platform.backButton.subscribe(() => {
              if (this.routerOutlet && this.routerOutlet.canGoBack()) {
                this.routerOutlet.pop();
              } else if (this.router.url === '/tabs/home') {
                this.presentAlertConfirm();
              } else {
                this.navCtrl.navigateForward('/tabs/home');
                //this.generic.showAlert("Exit", "Do you want to exit the app?", this.onYesHandler, this.onNoHandler, "backPress");
              }
            });*/
        });
    }



    async presentAlertConfirm() {
      console.log("working");
      const alert = await this.alertController.create({
        header: 'Exit!',
        message: 'Do you want to exit the app?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              //
            }
          }, {
            text: 'Yes',
            handler: () => {
              this.backButtonSubscription.unsubscribe();
              navigator['app'].exitApp();
            }
          }
        ]
      });
      await alert.present();
    }
}
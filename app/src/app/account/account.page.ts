import { Component } from '@angular/core';
import { NavController, ModalController, Platform, IonRouterOutlet } from '@ionic/angular';
import { Settings } from './../data/settings';
import { ApiService } from './../api.service';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Config } from './../config';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoginPage } from './../account/login/login.page';

@Component({
    selector: 'app-account',
    templateUrl: 'account.page.html',
    styleUrls: ['account.page.scss']
})
export class AccountPage {
    toggle: any;
    constructor(public modalController: ModalController, private statusBar: StatusBar, private config: Config, public api: ApiService, public navCtrl: NavController, public settings: Settings, public platform: Platform, private appRate: AppRate, private emailComposer: EmailComposer, private socialSharing: SocialSharing, public routerOutlet: IonRouterOutlet) {}
    goTo(path) {
        this.navCtrl.navigateForward(path);
    }
    async log_out() {
        this.settings.customer.id = undefined;
        this.settings.vendor = false;
        this.settings.administrator = false;
        this.settings.wishlist = [];
        await this.api.postItem('logout').then(res => {}, err => {
            console.log(err);
        });
        if((<any>window).AccountKitPlugin)
        (<any>window).AccountKitPlugin.logout();
    }
    rateApp() {
        if (this.platform.is('cordova')) {
            this.appRate.preferences.storeAppURL = {
                ios: this.settings.settings.rate_app_ios_id,
                android: this.settings.settings.rate_app_android_id,
                windows: 'ms-windows-store://review/?ProductId=' + this.settings.settings.rate_app_windows_id
            };
            this.appRate.promptForRating(false);
        }
    }
    shareApp() {
        if (this.platform.is('cordova')) {
            var url = '';
            if (this.platform.is('android')) url = this.settings.settings.share_app_android_link;
            else url = this.settings.settings.share_app_ios_link;
            var options = {
                message: '',
                subject: '',
                files: ['', ''],
                url: url,
                chooserTitle: ''
            }
            this.socialSharing.shareWithOptions(options);
        }
    }
    email(contact) {
        let email = {
            to: contact,
            attachments: [],
            subject: '',
            body: '',
            isHtml: true
        };
        this.emailComposer.open(email);
    }
    ngOnInit() {
        this.toggle = document.querySelector('#themeToggle');
        this.toggle.addEventListener('ionChange', (ev) => {
          document.body.classList.toggle('dark', ev.detail.checked);
        
          if(ev.detail.checked) {
            this.statusBar.backgroundColorByHexString('#121212');
            this.statusBar.styleLightContent();
          } else {
            this.statusBar.backgroundColorByHexString('#ffffff');
            this.statusBar.styleDefault();
          }
        
        });
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark.addListener((e) => checkToggle(e.matches));
        function loadApp() {
          checkToggle(prefersDark.matches);
        }
        function checkToggle(shouldCheck) {
          this.toggle.checked = shouldCheck;
        }
    }
    async login() {
        const modal = await this.modalController.create({
          component: LoginPage,
          componentProps: {
            path: 'tabs/account',
            },
          swipeToClose: true,
          //presentingElement: this.routerOutlet.nativeEl,
      });
      modal.present();
      const { data } = await modal.onWillDismiss();
    }
    
}
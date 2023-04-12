import { Component } from '@angular/core';
import { Config } from '../../config';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Settings } from './../../data/settings';
import { HomePage} from '../../home/home.page';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-currencies',
  templateUrl: './currencies.page.html',
  styleUrls: ['./currencies.page.scss'],
})
export class CurrenciesPage {
  params: any = {};
  constructor(public api: ApiService, public home: HomePage, public router: Router, public settings: Settings, public navCtrl: NavController) {
    this.params.action = 'wcml_switch_currency';
    this.params.currency = settings.currency;
    this.params.force_switch = '0';
  }
  async applyCurrency() {
    this.params.currency = this.settings.currency;
    await this.api.ajaxCall('/wp-admin/admin-ajax.php', this.params).then((res:any) => {
            
    });
    this.home.getBlocks();
    this.navCtrl.pop();
  }
}

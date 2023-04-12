import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';

@Component({
    selector: 'app-edit-address',
    templateUrl: './edit-address.page.html',
    styleUrls: ['./edit-address.page.scss'],
})
export class EditAddressPage implements OnInit {
    address: any = [];
    countries: any;
    states: any;
    billingStates: any;
    shippingStates: any;
    status: any;
    disableButton: boolean = false;
    constructor(public api: ApiService, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute) {}
    ngOnInit() {
        this.getCountries();
    }
    async getCountries() {
        await this.api.postItem('countries').then(res => {
            this.countries = res;
            if(this.countries && this.countries.length == 1) {
                this.address['billing_country'] = this.countries[0].value;
                this.address['shipping_country'] = this.countries[0].value;
                this.billingStates = this.countries.find(item => item.value == this.address['billing_country']);
                this.shippingStates = this.countries.find(item => item.value == this.address['billing_country']);
            } else {
                this.billingStates = this.countries.find(item => item.value == this.settings.customer.billing.country);
                this.shippingStates = this.countries.find(item => item.value == this.settings.customer.shipping.country);
            }
        }, err => {
            console.log(err);
        });
    }
    processAddress() {
        for (var key in this.settings.customer.billing) {
            this.address['billing_' + key] = this.settings.customer.billing[key];
        }
        for (var key in this.settings.customer.shipping) {
            this.address['shipping_' + key] = this.settings.customer.shipping[key];
        }
        this.updateAddress();
    }
    async updateAddress() {
        this.disableButton = true;
        await this.api.postItem('update-address', this.address).then(res => {
            this.status = res;
           // this.navCtrl.pop();
            this.disableButton = false;
        }, err => {
            this.disableButton = false;
        });
    }
    getBillingRegion() {
        this.billingStates = this.countries.find(item => item.value == this.settings.customer.billing.country);
        this.settings.customer.billing.state = '';

    }
    getShippingRegion() {
        this.shippingStates = this.countries.find(item => item.value == this.settings.customer.shipping.country);
        this.settings.customer.shipping.state = '';
    }
}
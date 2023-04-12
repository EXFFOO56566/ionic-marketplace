import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { CheckoutData } from '../../data/checkout';
import { Settings } from './../../data/settings';

@Component({
    selector: 'app-address',
    templateUrl: './address.page.html',
    styleUrls: ['./address.page.scss'],
})
export class CheckoutAddressPage implements OnInit {
    errorMessage: any;
    loader: boolean = false;
    countries: any;
    constructor(public api: ApiService, public checkoutData: CheckoutData, public router: Router, public navCtrl: NavController, public settings: Settings, public route: ActivatedRoute) {}
    ngOnInit() {
        this.getCheckoutForm();
        //this.getCountries();
    }
    async getCheckoutForm() {
        this.loader = true;
        await this.api.postItem('get_checkout_form').then(res => {
            this.checkoutData.form = res;
            this.checkoutData.form.sameForShipping = true;
            if(this.checkoutData.form.countries.length == 1) {
                this.checkoutData.form.billing_country = this.checkoutData.form.countries[0].value;
                this.checkoutData.form.shipping_country = this.checkoutData.form.countries[0].value;
            }
            this.checkoutData.billingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.billing_country);
            this.checkoutData.shippingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.shipping_country);
            this.loader = false;
        }, err => {
            console.log(err);
            this.loader = false;
        });
    }
    getCountries() {
        this.api.getItem('settings/general/woocommerce_specific_allowed_countries').then(res => {
            this.countries = res;
        }, err => {
            console.log(err);
        });
    }
    getBillingRegion() {
        this.checkoutData.billingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.billing_country);
        this.checkoutData.form.billing_state = '';
    }
    getShippingRegion() {
        this.checkoutData.shippingStates = this.checkoutData.form.countries.find(item => item.value == this.checkoutData.form.shipping_country);
        this.checkoutData.form.shipping_state = '';
    }
    async updateOrderReview() {
        await this.api.postItem('update_order_review').then(res => {
            this.checkoutData.orderReview = res;
        }, err => {
            console.log(err);
        });
    }
    
    continueCheckout() {

        this.errorMessage  = '';

        if(this.validateForm()){
            if(!this.checkoutData.form.ship_to_different_address || this.checkoutData.form.ship_to_different_address == false)
            this.assgnShippingAddress();
            this.navCtrl.navigateForward('/tabs/cart/checkout');
        }
    }

    validateForm(){
        if(this.checkoutData.form.billing_first_name == '' || this.checkoutData.form.billing_first_name == undefined){
            this.errorMessage = 'Billing first name is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_last_name == '' || this.checkoutData.form.billing_last_name == undefined){
            this.errorMessage = 'Billing last name is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_phone == '' || this.checkoutData.form.billing_phone == undefined){
            this.errorMessage = 'Billing phone is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_address_1 == '' || this.checkoutData.form.billing_address_1 == undefined){
            this.errorMessage = 'Billing Street address is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_city == '' || this.checkoutData.form.billing_city == undefined){
            this.errorMessage = 'Billing city is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_postcode == '' || this.checkoutData.form.billing_postcode == undefined){
            this.errorMessage = 'Billing post code is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_country == '' || this.checkoutData.form.billing_country == undefined){
            this.errorMessage = 'Billing country is a required field';
            return false;
        }

        if(this.checkoutData.form.billing_state == '' || this.checkoutData.form.billing_state == undefined){
            this.errorMessage = 'Billing state is a required field';
            return false;
        }

        if(this.checkoutData.form.ship_to_different_address){
                if(this.checkoutData.form.shipping_first_name == '' || this.checkoutData.form.shipping_first_name == undefined){
                    this.errorMessage = 'Shipping first name is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_last_name == '' || this.checkoutData.form.shipping_last_name == undefined){
                    this.errorMessage = 'Shipping last name is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_address_1 == '' || this.checkoutData.form.shipping_address_1 == undefined){
                    this.errorMessage = 'Shipping Street address is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_city == '' || this.checkoutData.form.shipping_city == undefined){
                    this.errorMessage = 'Shipping city is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_postcode == '' || this.checkoutData.form.shipping_postcode == undefined){
                    this.errorMessage = 'Shipping post code is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_country == '' || this.checkoutData.form.shipping_country == undefined){
                    this.errorMessage = 'Shipping country is a required field';
                    return false;
                }

                if(this.checkoutData.form.shipping_state == '' || this.checkoutData.form.shipping_state == undefined){
                    this.errorMessage = 'Shipping state is a required field';
                    return false;
                }
                return true;
        }

        else return true;
    }

    assgnShippingAddress(){
        this.checkoutData.form.shipping_first_name = this.checkoutData.form.billing_first_name;
        this.checkoutData.form.shipping_last_name = this.checkoutData.form.billing_last_name;
        this.checkoutData.form.shipping_company = this.checkoutData.form.billing_company;
        this.checkoutData.form.shipping_address_1 = this.checkoutData.form.billing_address_1;
        this.checkoutData.form.shipping_address_2 = this.checkoutData.form.billing_address_2;
        this.checkoutData.form.shipping_city = this.checkoutData.form.billing_city;
        this.checkoutData.form.shipping_postcode = this.checkoutData.form.billing_postcode;
        this.checkoutData.form.shipping_country = this.checkoutData.form.billing_country;
        this.checkoutData.form.shipping_state = this.checkoutData.form.billing_state;
        return true;
    }
}
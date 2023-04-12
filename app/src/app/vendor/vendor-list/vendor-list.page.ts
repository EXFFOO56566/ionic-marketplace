import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Settings } from './../../data/settings';
import { Vendor } from './../../data/vendor';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.page.html',
  styleUrls: ['./vendor-list.page.scss'],
})
export class VendorListPage implements OnInit {
    vendors: any;
    filter: any = {};
    hasMoreItems: boolean = true;
    tempVendor: any = [];
    searchInput: any;
    constructor(public platform: Platform, public api: ApiService, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute, public vendor: Vendor) {
      this.filter.page = 1;
      this.filter.per_page = 30;
      this.filter.wc_vendor = true;
    }

    ngOnInit() {
        
        //Commaon
        this.getVendors();

        // Delete all these once above is working fine
        //WCMP
        //this.getWcVendors();

        //DOKAN
        //this.getDokanVendors();

        //WCFM
        //this.getWCFMVendors();
    }

    async getVendors() {
        await this.api.postItem('vendors', this.filter).then((res: any) => {
            if(res)
            this.vendors = res;
        }, err => {
            console.log(err);
        });
    }
    
    async loadData(event) {
        this.filter.page = this.filter.page + 1;

        /* Common */
        await this.api.postItem('vendors', this.filter).then(res => {
            this.tempVendor = res;
            this.vendors.push.apply(this.vendors, res);
            event.target.complete();
            if (this.tempVendor && this.tempVendor.length == 0) this.hasMoreItems = false;
            else if (!this.tempVendor || !this.tempVendor.length) event.target.complete();
        }, err => {
            event.target.complete();
        });

        
        /* WC Marketplace */
       /*await this.api.WCMPVendor('vendors', this.filter).then((res) => {
            this.tempVendor = res;
            this.vendors.push.apply(this.vendors, res);
            event.target.complete();
            if (this.tempVendor && this.tempVendor.length == 0) this.hasMoreItems = false;
            else if (!this.tempVendor || !this.tempVendor.length) event.target.complete();
        }, err => {
            event.target.complete();
        });*/

        /* Dokan */
        /*await this.api.postItem('vendors-list', this.filter).then(res => {
            this.tempVendor = res;
            this.vendors.push.apply(this.vendors, res);
            event.target.complete();
            if (this.tempVendor && this.tempVendor.length == 0) this.hasMoreItems = false;
            else if (!this.tempVendor || !this.tempVendor.length) event.target.complete();
        }, err => {
            event.target.complete();
        });*/

        /* WCFM */
        /*await this.api.postItem('wcfm-vendor-list', this.filter).then(res => {
            this.tempVendor = res;
            this.vendors.push.apply(this.vendors, res);
            event.target.complete();
            if (this.tempVendor && this.tempVendor.length == 0) this.hasMoreItems = false;
            else if (!this.tempVendor || !this.tempVendor.length) event.target.complete();
        }, err => {
            event.target.complete();
        });*/


    }
    /* WC Marketplace */
    async getWcVendors() {
        await this.api.WCMPVendor('vendors', this.filter).then(res => {
            this.vendors = res;
        }, err => {
            console.log(err);
        });
    }
    async getDokanVendors() {
        await this.api.postItem('vendors-list', this.filter).then(res => {
            this.vendors = res;
        }, err => {
            console.log(err);
        });
    }
    async getWCFMVendors() {
        await this.api.postItem('wcfm-vendor-list', this.filter).then(res => {
            this.vendors = res;
        }, err => {
            console.log(err);
        });
    }
    getDetail(item) {
        this.vendor.vendor = item;
        this.navCtrl.navigateForward('/tabs/vendor/products');
    }
    onInput(){
        if (this.searchInput.length) {
            this.vendors = [];
            this.filter.search_term = this.searchInput;
            this.filter.page = 1;
            this.getVendors();
        } else {
            this.vendors = [];
            this.filter.search_term = '';
            this.filter.page = 1;
            this.getVendors();
        }
    }
}

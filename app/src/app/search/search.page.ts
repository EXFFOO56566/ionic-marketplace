import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
//import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';
import { Config } from '../config';
import { HttpParams } from "@angular/common/http";

@Component({
    selector: 'app-search',
    templateUrl: 'search.page.html',
    styleUrls: ['search.page.scss']
})
export class SearchPage implements OnInit {
    products: any = [];
    tempProducts: any = [];
    filter: any = {};
    hasMoreItems: boolean = true;
    searchInput: any = "";
    loading: boolean = false;

    cart: any = {};
    options: any = {};
    lan: any = {};
    variationId: any;
    gridView: boolean = true;

    constructor(public config: Config, public alertController: AlertController, public api: ApiService, public data: Data, public router: Router, public product: Product, public settings: Settings, public loadingController: LoadingController, public navCtrl: NavController, public route: ActivatedRoute/*, private barcodeScanner: BarcodeScanner*/) {
        this.filter.page = 1;
        if (this.settings.colWidthProducts == 4) this.filter.per_page = 15;
        this.filter.status = 'publish';
    }
    ngOnInit() {}
    async loadData(event) {
        this.filter.page = this.filter.page + 1;
        this.api.postItem('products', this.filter).then(res => {
            this.tempProducts = res;
            this.products.push.apply(this.products, this.tempProducts);
            event.target.complete();
            if (this.tempProducts.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
        console.log('Done');
    }
    onInput() {
        this.loading = true;
        this.hasMoreItems = true;
        this.filter.page = 1;
        delete this.filter.sku;
        this.filter.q = this.searchInput;
        if (this.searchInput.length) {
            this.getProducts();
        } else {
            this.products = [];
            this.loading = false;
        }
    }
    async getProducts() {
        this.api.postItem('products', this.filter).then(res => {
            this.products = res;
            this.loading = false;
        }, err => {
            console.log(err);
        });
    }
    getProduct(product) {
        this.product.product = product;
        this.navCtrl.navigateForward('/tabs/search/product/' + product.id);
    }
    scanBarcode() {
        /*this.barcodeScanner.scan().then(barcodeData => {
            if(barcodeData.text != '') {
                this.loading = true;
                this.hasMoreItems = true;
                this.filter.page = 1;
                delete this.filter.q;
                this.filter.sku = barcodeData.text;
                this.getProducts();
            }
        }).catch(err => {
            console.log('Error', err);
        });*/
    }
    async addToCart(product) {
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        } else if (product.type == 'variable') {
            this.getProduct(product);
        }
        else if (this.setVariations(product)) {

          if (this.data.cart[product.id] != undefined) this.data.cart[product.id] += 1;
          else this.data.cart[product.id] = 1;

          this.options.product_id = product.id;
          await this.api.postItem('add_to_cart', this.options).then(res => {
              this.cart = res;
              this.data.updateCart(this.cart.cart);
          }, err => {
              console.log(err);
          });
        }  
    }
    setVariations(product) {
        if(product.variationId){
            this.options.variation_id = product.variationId;
        }
        product.attributes.forEach(item => {
            if (item.selected) {
                this.options['variation[attribute_pa_' + item.name + ']'] = item.selected;
            }
        })
        for (var i = 0; i < product.attributes.length; i++) {
            if (product.type == 'variable' && product.attributes[i].variation && product.attributes[i].selected == undefined) {
                this.presentAlert(this.lan.options, this.lan.select +' '+ product.attributes[i].name +' '+ this.lan.option);
                return false;
            }
        }
        return true;
    }
    async presentAlert(header, message) {
        const alert = await this.alertController.create({
            header: header,
            message: message,
            buttons: ['OK']
        });
        await alert.present();
    }
    async updateToCart(product){
        var params: any = {};
        if(product.manage_stock && product.stock_quantity < this.data.cart[product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        } else {
          for (let key in this.data.cartItem) {
            if (this.data.cartItem[key].product_id == product.id) {
                  if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
                      this.data.cartItem[key].quantity = 0
                  }
                  else {
                      this.data.cartItem[key].quantity += 1
                  };
                  if (this.data.cart[product.id] != undefined && this.data.cart[product.id] == 0) {
                      this.data.cart[product.id] = 0
                  }
                  else {
                      this.data.cart[product.id] += 1
                  };
                  params.key = key;
                  params.quantity = this.data.cartItem[key].quantity;
            }      
          }
          params.update_cart = 'Update Cart';
          params._wpnonce = this.data.cartNonce;
          await this.api.postItem('update-cart-item-qty', params).then(res => {
              this.cart = res;
              this.data.updateCart(this.cart.cart_contents);
          }, err => {
              console.log(err);
          });
        }
    }
    async deleteFromCart(product){
        var params: any = {};
        for (let key in this.data.cartItem) {
          if (this.data.cartItem[key].product_id == product.id) {
            if (this.data.cartItem[key].quantity != undefined && this.data.cartItem[key].quantity == 0) {
                this.data.cartItem[key].quantity = 0;
            }
            else {
                this.data.cartItem[key].quantity -= 1;
            };
            if (this.data.cart[product.id] != undefined && this.data.cart[product.id] == 0) {
                this.data.cart[product.id] = 0
            }
            else {
                this.data.cart[product.id] -= 1
            };
            params.key = key;
            params.quantity = this.data.cartItem[key].quantity;
          }      
        }    
        params.update_cart = 'Update Cart';
        params._wpnonce = this.data.cartNonce;
        await this.api.postItem('update-cart-item-qty', params).then(res => {
            console.log(res);
            this.cart = res;
            this.data.updateCart(this.cart.cart_contents);
        }, err => {
            console.log(err);
        });
    }
}
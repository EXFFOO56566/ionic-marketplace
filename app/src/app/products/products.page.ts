import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController  } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
import { FilterPage } from '../filter/filter.page';
import { Vendor } from '../data/vendor';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { Config } from '../config';
import { HttpParams } from "@angular/common/http";

@Component({
    selector: 'app-products',
    templateUrl: 'products.page.html',
    styleUrls: ['products.page.scss']
})
export class ProductsPage {
    products: any = [];
    tempProducts: any = [];
    subCategories: any = [];
    filter: any = {};
    attributes: any;
    hasMoreItems: boolean = true;
    loader: boolean = false;
    searchInput: any;
    showSearch: boolean = true;

    cart: any = {};
    options: any = {};
    lan: any = {};
    variationId: any;
    gridView: boolean = true;

    constructor(public config: Config, public alertController: AlertController, public translate: TranslateService, public vendor: Vendor, public modalController: ModalController, public api: ApiService, public data: Data, public product: Product, public settings: Settings, public router: Router, public navCtrl: NavController, public route: ActivatedRoute) {
        this.filter.page = 1;
        this.filter.status = 'publish';
        this.options.quantity = 1;
    }
    async getFilter() {
        const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
                filter: this.filter,
                attributes: this.attributes
            }
        });
        modal.present();
        const {
            data
        } = await modal.onDidDismiss();
        if (data) {
            this.filter = data;
            Object.keys(this.filter).forEach(key => this.filter[key] === undefined ? delete this.filter[key] : '');
            this.filter.page = 1;
            this.getProducts();
        }
    }
    loadData(event) {
        this.filter.page = this.filter.page + 1;
        this.api.postItem('products', this.filter).then(res => {
            this.tempProducts = res;
            this.products.push.apply(this.products, this.tempProducts);
            event.target.complete();
            if (this.tempProducts.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
    getProducts() {
        this.loader = true;
        this.api.postItem('products', this.filter).then(res => {
            console.log(res);
            this.products = res;
            this.loader = false;
        }, err => {
            console.log(err);
        });
    }
    getAttributes() {
        this.api.postItem('product-attributes', {
            category: this.filter.id
        }).then(res => {
            this.attributes = res;
        }, err => {
            console.log(err);
        });
    }
    ngOnInit() {
        if(this.route.snapshot.paramMap.get('id')){
            this.filter.id = this.route.snapshot.paramMap.get('id');
        }
        if(this.vendor.vendor.id){
            this.filter.vendor = this.vendor.vendor.id ? this.vendor.vendor.id : this.vendor.vendor.ID;
        }
        if(this.vendor.vendor.wcpv_product_vendors) {
            delete this.filter.vendor;
            this.filter.wcpv_product_vendors = this.vendor.vendor.wcpv_product_vendors;
        }
        if (this.data.categories && this.data.categories.length) {
            for (var i = 0; i < this.data.categories.length; i++) {
                if (this.data.categories[i].parent == this.filter.id) {
                    this.subCategories.push(this.data.categories[i]);
                }
            }
        }
        if (this.settings.colWidthProducts == 4) this.filter.per_page = 15;
        this.getProducts();
        this.getAttributes();

        this.translate.get(['Oops!', 'Please Select', 'Please wait', 'Options', 'Option', 'Select', 'Item added to cart', 'Message', 'Requested quantity not available'  ]).subscribe(translations => {
          this.lan.oops = translations['Oops!'];
          this.lan.PleaseSelect = translations['Please Select'];
          this.lan.Pleasewait = translations['Please wait'];
          this.lan.options = translations['Options'];
          this.lan.option = translations['Option'];
          this.lan.select = translations['Select'];
          this.lan.addToCart = translations['Item added to cart'];
          this.lan.message = translations['Message'];
          this.lan.lowQuantity = translations['Requested quantity not available'];
        });
    }
    getProduct(product) {
        this.product.product = product;
        this.navCtrl.navigateForward(this.router.url + '/product/' + product.id);
    }
    getCategory(id) {
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + id);
    }
    loaded(product){
        console.log('Loaded');
        product.loaded = true;
    }
    onInput(){
        if (this.searchInput.length) {
            this.products = [];
            this.filter.q = this.searchInput;
            this.filter.page = 1;
            this.getProducts();
        } else {
            this.products = [];
            this.filter.q = '';
            this.filter.page = 1;
            this.getProducts();
        }
    }
    ionViewWillLeave(){
        this.showSearch = false;
    }
    ionViewDidLeave() {
        this.vendor.vendor = {};
        this.showSearch = true;
    }
    toggleGridView() {
        this.gridView = !this.gridView;
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
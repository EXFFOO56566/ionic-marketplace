import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';
import { Product } from '../data/product';
import { md5 } from './md5';
import { ReviewPage } from '../review/review.page';
import { AlertController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Vendor } from '../data/vendor';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
    selector: 'app-product',
    templateUrl: 'product.page.html',
    styleUrls: ['product.page.scss']
})
export class ProductPage {
    product: any;
    filter: any = {};
    usedVariationAttributes: any = [];
    options: any = {};
    id: any;
    variations: any = [];
    groupedProducts: any = [];
    productDetails: any = {};
    reviews: any = [];
    cart: any = {};
    status: any;
    disableButton: boolean = false;
    quantity: any;
    addons: any;//ADDONS
    addonsList: any = [];//ADDONS
    lan: any = {};
    variationId: any;
    results: any;
    constructor(public translate: TranslateService, public toastController: ToastController, private socialSharing: SocialSharing, public modalCtrl: ModalController, public api: ApiService, public data: Data, public productData: Product, public settings: Settings, public router: Router, public loadingController: LoadingController, public navCtrl: NavController, public alertController: AlertController, public route: ActivatedRoute, public vendor: Vendor, public iab: InAppBrowser) {
        this.filter.page = 1;
        this.quantity = "1";
    }
    getReviewsPage() {
        let navigationExtras = {
            queryParams: {
              ratingVerificationRequired: this.productDetails.rating_verification_required,
              customerBoughtProduct: this.productDetails.customer_bought_product
            }
        };
        this.navCtrl.navigateForward(this.router.url + '/review/' + this.product.id, navigationExtras);
    }
    getProduct() {
        this.api.postItem('product', {'product_id': this.id}).then(res => {
            this.product = res;
            this.handleProduct();
        }, err => {
            console.log(err);
        });
    }
    ngOnInit() {
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
        this.product = this.productData.product;
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.product.id) this.handleProduct();
         else this.getProduct();
    }
    handleProduct() {

        /* Reward Points */
        if(this.settings.settings.switchRewardPoints && this.product.meta_data)
        this.product.meta_data.forEach(item => {
            if(item.key == '_wc_points_earned'){
                this.product.showPoints = item.value;
            }
        });

        /* Product Addons */
        if(this.settings.settings.switchAddons ===  1)
        this.getAddons();

        this.usedVariationAttributes = this.product.attributes.filter(function(attribute) {
            return attribute.variation == true
        });
    
        //if ((this.product.type == 'variable') && this.product.variations.length) this.getVariationProducts();
        if ((this.product.type == 'grouped') && this.product.grouped_products.length)
        this.getGroupedProducts();
        this.getRelatedProducts();
        this.getReviews();
    }
    getVariationProducts() {
        this.api.getItem('products/' + this.product.id + '/variations', {per_page: 100}).then(res => {
            this.variations = res;
        }, err => {});
    }
    getGroupedProducts(){
        if (this.product.grouped_products.length) {
            var filter = [];
            for (let item in this.product.grouped_products) filter['include[' + item + ']'] = this.product.grouped_products[item];
            this.api.getItem('products', filter).then(res => {
                this.groupedProducts = res;
            }, err => {});
        }
    }
    getRelatedProducts() {
        var filter = [];
        filter['product_id'] = this.product.id;
        this.api.postItem('product_details', filter).then(res => {
            this.productDetails = res;
        }, err => {});
    }
    getReviews() {
        this.api.postItem('product_reviews', {'product_id': this.product.id}).then(res => {
            this.reviews = res;
            for (let item in this.reviews) {
                this.reviews[item].avatar = md5(this.reviews[item].email);
            }
        }, err => {});
    }
    goToProduct(product) {
        this.productData.product = product;
        var endIndex = this.router.url.lastIndexOf('/');
        var path = this.router.url.substring(0, endIndex);
        this.navCtrl.navigateForward(path + '/' + product.id);
    }
    async addToCart() {
        if(this.product.manage_stock && this.product.stock_quantity < this.data.cart[this.product.id]) {
            this.presentAlert(this.lan.message, this.lan.lowQuantity);
        }
        else if (this.selectAdons() && this.setVariations2() && this.setGroupedProducts()) {
            if(this.product.type != 'grouped') {
                this.options.quantity = this.quantity;
            }
            this.options.product_id = this.product.id;
            this.disableButton = true;
            await this.api.postItem('add_to_cart', this.options).then(res => {
                this.results = res;
                if(this.results.error) {
                    this.presentToast(this.results.notice);
                } else { 
                    this.cart = res;
                    this.presentToast(this.lan.addToCart);
                    this.data.updateCart(this.cart.cart);
                }
                this.disableButton = false;
            }, err => {
                console.log(err);
                this.disableButton = false;
            });
        }
    }
    async presentToast(message) {
        const toast = await this.toastController.create({
          message: message.replace(/<[^>]*>/g, ''),
          duration: 2000,
          position: 'top'
        });
        toast.present();
    }
    setVariations() {
        if(this.variationId){
            this.options.variation_id = this.variationId;
        }
        this.product.attributes.forEach(item => {
            if (item.selected) {
                this.options['variation[attribute_pa_' + item.name + ']'] = item.selected;
            }
        })
        for (var i = 0; i < this.product.attributes.length; i++) {
            if (this.product.attributes[i].variation && this.product.attributes[i].selected == undefined) {
                this.presentAlert(this.lan.options, this.lan.select +' '+ this.product.attributes[i].name +' '+ this.lan.option);
                return false;
            }
        }
        return true;
    }
    setVariations2() {
        var doAdd = true;
        if (this.product.type == 'variable' && this.product.variationOptions != null) {
          for (var i = 0; i < this.product.variationOptions.length; i++) {
            if (this.product.variationOptions[i].selected != null) {
              this.options['variation[attribute_' + this.product.variationOptions[i].attribute +
                  ']'] = this.product.variationOptions[i].selected;
            } else if (this.product.variationOptions[i].selected == null && this.product.variationOptions[i].options.length != 0) {
              this.presentAlert(this.lan.options, this.lan.select +' '+ this.product.variationOptions[i].name);
              doAdd = false;
              break;
            } else if (this.product.variationOptions[i].selected == null && this.product.variationOptions[i].options.length == 0) {
              this.product.stock_status = 'outofstock';
              doAdd = false;
              break;
            }
          }
          if (this.product.variation_id) {
            this.options['variation_id'] = this.product.variation_id;
          }
        }
        return doAdd;
    }
    chooseVariation2(index, value) {
        this.product.variationOptions[index].selected = value;
        this.product.stock_status = 'instock';
        if (this.product.variationOptions.every((option) => option.selected != null)) {
            var selectedOptions = [];
            var matchedOptions = [];
            for (var i = 0; i < this.product.variationOptions.length; i++) {
                selectedOptions.push(this.product.variationOptions[i].selected);
            }
            for (var i = 0; i < this.product.availableVariations.length; i++) {
                matchedOptions = [];
                for (var j = 0; j < this.product.availableVariations[i].option.length; j++) {
                  if (selectedOptions.includes(this.product.availableVariations[i].option[j].value) || this.product.availableVariations[i].option[j].value == '') {
                    matchedOptions.push(this.product.availableVariations[i].option[j].value);
                  }
                }
                if (matchedOptions.length == selectedOptions.length) {
                    this.product.variation_id = this.product.availableVariations[i].variation_id;
                    this.product.price = this.product.availableVariations[i].display_price;
                    this.product.regular_price = this.product.availableVariations[i].display_regular_price;
                    this.product.formated_price = this.product.availableVariations[i].formated_price;
                    this.product.formated_sales_price = this.product.availableVariations[i].formated_sales_price;
                    if (this.product.availableVariations[i].display_regular_price != this.product.availableVariations[i].display_price)
                        this.product.sale_price = this.product.availableVariations[i].display_price;
                    else
                        this.product.sale_price = null;
                    if (!this.product.availableVariations[i].is_in_stock) {
                        this.product.stock_status = 'outofstock';
                    }
                    
                    break;
                }
              }
              if (matchedOptions.length != selectedOptions.length) {
                this.product.stock_status = 'outofstock';
              }
        }
    }
    chooseVariation(att, value) {
        this.product.attributes.forEach(item => {
            item.selected = undefined;
        })
        this.product.attributes.forEach(item => {
            if (item.name == att.name) {
                item.selected = value;
            }
        })
        if (this.usedVariationAttributes.every(a => a.selected !== undefined))
        this.variations.forEach(variation => {
            var test = new Array(this.usedVariationAttributes.length);
            test.fill(false);
            this.usedVariationAttributes.forEach(attribute => {
                if (variation.attributes.length == 0) {
                    this.variationId = variation.id;
                    this.product.stock_status = variation.stock_status;
                    this.product.price = variation.price;
                    this.product.sale_price = variation.sale_price;
                    this.product.regular_price = variation.regular_price;
                    this.product.manage_stock = variation.manage_stock;
                    this.product.stock_quantity = variation.stock_quantity;
                    //this.product.images[0] = variation.image; /* Uncomment this if you want to use variation images */
                } else {
                    variation.attributes.forEach((item, index) => {
                        if (item.name == attribute.name && item.option == attribute.selected) {
                            test[index] = true;
                        }
                    })
                    if (test.every(v => v == true)) {
                        this.variationId = variation.id;
                        this.product.stock_status = variation.stock_status;
                        this.product.price = variation.price;
                        this.product.sale_price = variation.sale_price;
                        this.product.regular_price = variation.regular_price;
                        this.product.manage_stock = variation.manage_stock;
                        this.product.stock_quantity = variation.stock_quantity;
                        //this.product.images[0] = variation.image;  /* Uncomment this if you want to use variation images */
                        test.fill(false);
                    } else if (variation.attributes.length != 1 && variation.attributes.length == this.usedVariationAttributes.length && test.some(v => v == false)) {
                        //this.product.stock_status = 'outofstock';
                        //this.options.variation_id = variation.id;
                    }
                }
            })
        })
    }
    async presentAlert(header, message) {
        const alert = await this.alertController.create({
            header: header,
            message: message,
            buttons: ['OK']
        });
        await alert.present();
    }
    OnDestroy() {
        this.productData.product = {};
    }
    share(){
        var options = {
            message: "Check this out!",
            subject: this.product.name,
            files: ['', ''],
            url: this.product.permalink,
            chooserTitle: 'Choose an App'
        }
        
        this.socialSharing.shareWithOptions(options);
    }
    getDetail(vendor) {
        console.log(vendor);
        this.vendor.vendor = vendor;
        var pages = this.router.url.split('/');
        this.navCtrl.navigateForward('/tabs/' + pages[2] + '/vendor-products');
    }
    buyExternalProduct(id){
        var options = "location=no,hidden=yes,toolbar=no,hidespinner=yes";
        let browser = this.iab.create(this.product.external_url, '_blank', options);
        browser.show();
    }
    setGroupedProducts(){
        if(this.product.type == 'grouped') {
            this.options['add-to-cart'] = this.product.id;
            this.groupedProducts.forEach(item => {
                if(item.selected){
                    this.options['quantity['+ item.id +']'] = item.selected;
                }
            })
            return true;

        } else return true;
    }

    /* PRODUCT ADDONS */
    getAddons(){
        if(this.product.meta_data){
            for(let item in this.product.meta_data){
                if(this.product.meta_data[item].key == '_product_addons' && this.product.meta_data[item].value.length){
                    this.addonsList.push(...this.product.meta_data[item].value)           
                }
            }
        }
        this.getGlobalAddons()
    }
    getGlobalAddons(){
        this.api.getAddonsList('product-add-ons').then(res => {
            this.handleAddonResults(res);
        });
    }
    handleAddonResults(results){
        if(results && results.length)
        results.forEach(item => {
            this.addonsList.push(...item.fields)
        });
    }
    selectAdons() {
        this.options = {};
        let valid = this.validateform();
        if(valid) {
            this.addonsList.forEach((value, i) => {
                value.selectedName = value.name.toLowerCase();
                value.selectedName = value.selectedName.split(' ').join('-');
                value.selectedName = value.selectedName.split('.').join('');
                value.selectedName = value.selectedName.replace(':','');
                    value.options.forEach((option, j) => {
                        option.selectedLabel = option.label.toLowerCase();
                        option.selectedLabel = option.selectedLabel.split(' ').join('-');
                        option.selectedLabel = option.selectedLabel.split('.').join('');
                        option.selectedLabel = option.selectedLabel.replace(':','');
                        if (value.selected instanceof Array) {
                            if (value.selected.includes(option.label)) {
                                this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i + '[' + j + ']' ] = option.selectedLabel;
                            }
                        }
                        else if (option.label == value.selected && value.type == 'select') {
                            this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i ] = option.selectedLabel + '-' + (j + 1);
                        }
                        else if (option.label == value.selected && value.type == 'radiobutton') {
                            this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i + '[' + j + ']' ] = option.selectedLabel;
                        }
                        else if (value.type === 'custom_textarea' && option.input && option.input !== '') {
                            this.options['addon-' + this.product.id + '-' + value.selectedName + '-' + i + '[' + option.selectedLabel + ']' ] = option.input;
                        }
                    });
                if(value.type == 'custom_text'){
                    let label = value.name;
                    label = label.toLowerCase();
                    label = label.split(' ').join('-');
                    label = label.split('.').join('');
                    label = label.replace(':','');
                    this.options['addon-' + this.product.id + '-' + label + '-' + i ] = value.input;
                }    
            });
        }
        return valid;
    }
    validateform(){
        if(this.addonsList){
             for(let addon in this.addonsList){
                for(let item in this.addonsList[addon].fields){
                    if(this.addonsList[addon].fields[item].required == 1 && this.addonsList[addon].fields[item].selected == ''){
                        this.presentAlert(this.lan.oops, this.lan.PleaseSelect +' '+ this.addonsList[addon].fields[item].name);
                        return false;
                    }
                }
                if(this.addonsList[addon].type == 'custom_text'){
                    if(this.addonsList[addon].required == 1 && (!this.addonsList[addon].input || this.addonsList[addon].input == '')){
                        this.presentAlert(this.lan.oops, this.lan.PleaseSelect +' '+ this.addonsList[addon].name);
                        return false;
                    }
                }  
            }
            return true;
        }
        return true;
    }
    /* PRODUCT ADDONS */
}
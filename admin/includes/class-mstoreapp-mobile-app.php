<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       http://mstoreapp.com
 * @since      1.0.0
 *
 * @package    Mstoreapp_Mobile_App
 * @subpackage Mstoreapp_Mobile_App/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Mstoreapp_Mobile_App
 * @subpackage Mstoreapp_Mobile_App/includes
 * @author     Mstoreapp <support@mstoreapp.com>
 */
class Mstoreapp_Mobile_App {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Mstoreapp_Mobile_App_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {

		$this->plugin_name = 'mstoreapp-mobile-app';
		$this->version = '1.0.0';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();

	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Mstoreapp_Mobile_App_Loader. Orchestrates the hooks of the plugin.
	 * - Mstoreapp_Mobile_App_i18n. Defines internationalization functionality.
	 * - Mstoreapp_Mobile_App_Admin. Defines all hooks for the admin area.
	 * - Mstoreapp_Mobile_App_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mstoreapp-mobile-app-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mstoreapp-mobile-app-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-mstoreapp-mobile-app-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-mstoreapp-mobile-app-public.php';

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-mstoreapp-mobile-app-multivendor.php';

		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/admin-init.php';


		$this->loader = new Mstoreapp_Mobile_App_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Mstoreapp_Mobile_App_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new Mstoreapp_Mobile_App_i18n();

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Mstoreapp_Mobile_App_Admin( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );


		$this->loader->add_action( 'edit_user_profile', $plugin_admin, 'add_vendor_type_fields' );
		$this->loader->add_action( 'edit_user_profile_update', $plugin_admin, 'save_vendor_type_fields' );

		$this->loader->add_action( 'init', $plugin_admin, 'handle_orgin' );

		$this->loader->add_action('wp_ajax_mstoreapp-mobile-app-notification', $plugin_admin, 'mobile_app_notification');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-mobile-app-notification', $plugin_admin, 'mobile_app_notification');

		$this->loader->add_action('admin_menu', $plugin_admin, 'mstoreapp_mobile_app_menu');
		//$this->loader->add_action('admin_menu', $plugin_admin, 'push_notification_menu');
        $this->loader->add_action('admin_init', $plugin_admin, 'register_mstoreapp_mobile_app_settings');

        $this->loader->add_action( 'woocommerce_new_order', $plugin_admin, 'neworder',  10, 1  );

        $this->loader->add_action( 'save_post', $plugin_admin, 'save_new_post', 10, 1  );

        $this->loader->add_action('woocommerce_order_status_changed', $plugin_admin, 'neworder', 10, 1  );

        $this->loader->add_filter('woocommerce_rest_product_object_query', $plugin_admin, 'mstoreapp_prepare_product_query', 10, 2);

        $this->loader->add_filter('woocommerce_rest_product_cat_query', $plugin_admin, 'remove_uncategorized_category', 10, 1);

        /* For All Multi Vendor */
        $this->loader->add_action('wp_ajax_mstoreapp_upload_image', $plugin_admin, 'uploadimage');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp_upload_image', $plugin_admin, 'uploadimage');

        $this->loader->add_action('wp_ajax_mstoreapp_upload_images', $plugin_admin, 'uploadimages');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp_upload_images', $plugin_admin, 'uploadimages');

        /* This is for WC Marketplace only */
        $this->loader->add_filter('wcmp_rest_prepare_dc_vendor_object', $plugin_admin, 'mstoreapp_prepare_vendors_query', 10, 3);

        /* WC Marketplace and WCFM Same Function, Dokan Different Function. */
        $this->loader->add_filter('woocommerce_rest_shop_order_object_query', $plugin_admin, 'mstoreapp_prepare_order_query', 10, 2);

        /* For Dokan and WCFM Only */
        $this->loader->add_action('wp_ajax_mstoreapp-update-vendor-product', $plugin_admin, 'update_vendor_product');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-update-vendor-product', $plugin_admin, 'update_vendor_product');

        /* For Dokan Only */
        $this->loader->add_filter('woocommerce_rest_prepare_product_object', $plugin_admin, 'mstoreapp_prepare_product', 10, 3);

        $this->loader->add_action('wp_ajax_mstoreapp-vendor-order-list', $plugin_admin, 'vendor_order_list');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-vendor-order-list', $plugin_admin, 'vendor_order_list');

        $this->loader->add_action('wp_ajax_mstoreapp-set_fulfill_status', $plugin_admin, 'set_fulfill_status');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-set_fulfill_status', $plugin_admin, 'set_fulfill_status');

	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Mstoreapp_Mobile_App_Public( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

		$this->loader->add_filter( 'query_vars', $plugin_public, 'add_query_vars' );

        $this->loader->add_action('wp_ajax_mstoreapp-keys', $plugin_public, 'keys');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-keys', $plugin_public, 'keys');

        $this->loader->add_action('wp_ajax_mstoreapp-login', $plugin_public, 'login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-login', $plugin_public, 'login');

        $this->loader->add_action('wp_ajax_mstoreapp-flutter-create-user', $plugin_public, 'flutter_create_user');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-flutter-create-user', $plugin_public, 'flutter_create_user');

        $this->loader->add_action('wp_ajax_mstoreapp-flutter-login', $plugin_public, 'flutter_login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-flutter-login', $plugin_public, 'flutter_login');

        $this->loader->add_action('wp_ajax_mstoreapp-flutter-facebook-login', $plugin_public, 'flutter_facebook_login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-flutter-facebook-login', $plugin_public, 'flutter_facebook_login');

	    $this->loader->add_action('wp_ajax_mstoreapp-flutter-google-login', $plugin_public, 'flutter_google_login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-flutter-google-login', $plugin_public, 'flutter_google_login');

        $this->loader->add_action('wp_ajax_mstoreapp-customer', $plugin_public, 'current_customer');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-customer', $plugin_public, 'current_customer');

        $this->loader->add_action('wp_ajax_mstoreapp-cart', $plugin_public, 'cart');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-cart', $plugin_public, 'cart');

        $this->loader->add_action('wp_ajax_mstoreapp-apply_coupon', $plugin_public, 'apply_coupon');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-apply_coupon', $plugin_public, 'apply_coupon');

        $this->loader->add_action('wp_ajax_mstoreapp-test', $plugin_public, 'test');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-test', $plugin_public, 'test');

        $this->loader->add_action('wp_ajax_mstoreapp-flutter', $plugin_public, 'flutter_test');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-flutter', $plugin_public, 'flutter_test');

        $this->loader->add_action('wp_ajax_mstoreapp-remove_coupon', $plugin_public, 'remove_coupon');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-remove_coupon', $plugin_public, 'remove_coupon');

        $this->loader->add_action('wp_ajax_mstoreapp-update_shipping_method', $plugin_public, 'update_shipping_method');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-update_shipping_method', $plugin_public, 'update_shipping_method');

        $this->loader->add_action('wp_ajax_mstoreapp-remove_cart_item', $plugin_public, 'remove_cart_item');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-remove_cart_item', $plugin_public, 'remove_cart_item');

        $this->loader->add_action('wp_ajax_mstoreapp-get_checkout_form', $plugin_public, 'get_checkout_form');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-get_checkout_form', $plugin_public, 'get_checkout_form');

        $this->loader->add_action('wp_ajax_mstoreapp-update_order_review', $plugin_public, 'update_order_review');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-update_order_review', $plugin_public, 'update_order_review');

        $this->loader->add_action('wp_ajax_mstoreapp-add_to_cart', $plugin_public, 'add_to_cart');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-add_to_cart', $plugin_public, 'add_to_cart');

        $this->loader->add_action('wp_ajax_mstoreapp-payment', $plugin_public, 'payment');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-payment', $plugin_public, 'payment');

        $this->loader->add_action('wp_ajax_mstoreapp-userdata', $plugin_public, 'userdata');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-userdata', $plugin_public, 'userdata');

        $this->loader->add_action('wp_ajax_mstoreapp-public-mobile-app-notification', $plugin_public, 'mobile_app_notification');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-public-mobile-app-notification', $plugin_public, 'mobile_app_notification');

        $this->loader->add_action('wp_ajax_mstoreapp-json_search_products', $plugin_public, 'json_search_products');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-json_search_products', $plugin_public, 'json_search_products');

        $this->loader->add_action('wp_ajax_mstoreapp-nonce', $plugin_public, 'nonce');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-nonce', $plugin_public, 'nonce');

        $this->loader->add_action('wp_ajax_mstoreapp-passwordreset', $plugin_public, 'passwordreset');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-passwordreset', $plugin_public, 'passwordreset');

        $this->loader->add_action('wp_ajax_mstoreapp-get_country', $plugin_public, 'get_country');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-get_country', $plugin_public, 'get_country');

        $this->loader->add_action('wp_ajax_mstoreapp-get_wishlist', $plugin_public, 'get_wishlist');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-get_wishlist', $plugin_public, 'get_wishlist');

        $this->loader->add_action('wp_ajax_mstoreapp-add_wishlist', $plugin_public, 'add_wishlist');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-add_wishlist', $plugin_public, 'add_wishlist');

        $this->loader->add_action('wp_ajax_mstoreapp-remove_wishlist', $plugin_public, 'remove_wishlist');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-remove_wishlist', $plugin_public, 'remove_wishlist');

        $this->loader->add_action('wp_ajax_mstoreapp-page_content', $plugin_public, 'pagecontent');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-page_content', $plugin_public, 'pagecontent');

        $this->loader->add_action('wp_ajax_mstoreapp-related_products', $plugin_public, 'get_related_products');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-related_products', $plugin_public, 'get_related_products');

        $this->loader->add_action('wp_ajax_mstoreapp_set_fulfill_status', $plugin_public, 'set_fulfill_status');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp_set_fulfill_status', $plugin_public, 'set_fulfill_status');

        $this->loader->add_action('wp_ajax_mstoreapp-facebook_connect', $plugin_public, 'facebook_connect');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-facebook_connect', $plugin_public, 'facebook_connect');

	    $this->loader->add_action('wp_ajax_mstoreapp-google_connect', $plugin_public, 'google_connect');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-google_connect', $plugin_public, 'google_connect');

        $this->loader->add_action('wp_ajax_mstoreapp-facebook_login', $plugin_public, 'facebook_login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-facebook_login', $plugin_public, 'facebook_login');

	    $this->loader->add_action('wp_ajax_mstoreapp-google_login', $plugin_public, 'google_login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-google_login', $plugin_public, 'google_login');

	    $this->loader->add_action('wp_ajax_mstoreapp-phone_number_login', $plugin_public, 'phone_number_login');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-phone_number_login', $plugin_public, 'phone_number_login');

	    $this->loader->add_action('wp_ajax_mstoreapp-logout', $plugin_public, 'logout');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-logout', $plugin_public, 'logout');

	    $this->loader->add_action('wp_ajax_mstoreapp-emptyCart', $plugin_public, 'emptyCart');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-emptyCart', $plugin_public, 'emptyCart');

	    $this->loader->add_action('wp_ajax_mstoreapp-update_user_notification', $plugin_public, 'update_user_notification');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-update_user_notification', $plugin_public, 'update_user_notification');

	    $this->loader->add_action('wp_ajax_mstoreapp-email-otp', $plugin_public, 'email_otp');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-email-otp', $plugin_public, 'email_otp');

        $this->loader->add_action('wp_ajax_mstoreapp-reset-user-password', $plugin_public, 'reset_user_password');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-reset-user-password', $plugin_public, 'reset_user_password');

        $this->loader->add_action('wp_ajax_mstoreapp-create-user', $plugin_public, 'create_user');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-create-user', $plugin_public, 'create_user');

        $this->loader->add_action('wp_ajax_mstoreapp-update-address', $plugin_public, 'update_address');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-update-address', $plugin_public, 'update_address');

        $this->loader->add_action('wp_ajax_mstoreapp-get-states', $plugin_public, 'get_states');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-get-states', $plugin_public, 'get_states');

        $this->loader->add_action('wp_ajax_mstoreapp-product-attributes', $plugin_public, 'product_attributes');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-product-attributes', $plugin_public, 'product_attributes');

        $this->loader->add_action('wp_ajax_mstoreapp-locations', $plugin_public, 'locations');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-locations', $plugin_public, 'locations');

        $this->loader->add_action('wp_ajax_mstoreapp-wallet', $plugin_public, 'get_wallet');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-wallet', $plugin_public, 'get_wallet');

        $this->loader->add_action('wp_ajax_mstoreapp-woo_refund_key', $plugin_public, 'woo_refund_key');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-woo_refund_key', $plugin_public, 'woo_refund_key');

        $this->loader->add_action('wp_ajax_mstoreapp-categories', $plugin_public, 'get_categories');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-categories', $plugin_public, 'get_categories');

        $this->loader->add_action('wp_ajax_mstoreapp-products', $plugin_public, 'getProducts');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-products', $plugin_public, 'getProducts');

        $this->loader->add_action('wp_ajax_mstoreapp-countries', $plugin_public, 'getCountries');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-countries', $plugin_public, 'getCountries');

        $this->loader->add_action('wp_ajax_mstoreapp-product', $plugin_public, 'getProduct');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-product', $plugin_public, 'getProduct');

        $this->loader->add_action('wp_ajax_mstoreapp-orders', $plugin_public, 'getOrders');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-orders', $plugin_public, 'getOrders');

        $this->loader->add_action('wp_ajax_mstoreapp-order', $plugin_public, 'getOrder');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-order', $plugin_public, 'getOrder');

        $this->loader->add_action('wp_ajax_mstoreapp-customer', $plugin_public, 'getCustomerDetail');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-customer', $plugin_public, 'getCustomerDetail');

        $this->loader->add_action('wp_ajax_mstoreapp-product_details', $plugin_public, 'getProductDetail');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-product_details', $plugin_public, 'getProductDetail');

        $this->loader->add_action('wp_ajax_mstoreapp-product_reviews', $plugin_public, 'getProductReviews');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-product_reviews', $plugin_public, 'getProductReviews');

        $this->loader->add_action('wp_ajax_mstoreapp-update-cart-item-qty', $plugin_public, 'updateCartQty');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-update-cart-item-qty', $plugin_public, 'updateCartQty');

        $this->loader->add_action('wp_ajax_mstoreapp-process_payment', $plugin_public, 'process_payment');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-process_payment', $plugin_public, 'process_payment');

        $this->loader->add_action('wp_ajax_mstoreapp-get_notice', $plugin_public, 'get_stripe_intent');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-get_notice', $plugin_public, 'get_stripe_intent');

        $this->loader->add_action('wp_ajax_mstoreapp-peach', $plugin_public, 'generate_checkout_form');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-peach', $plugin_public, 'generate_checkout_form');

        $this->loader->add_filter( 'woocommerce_product_data_store_cpt_get_products_query', $plugin_public, 'handling_custom_meta_query_keys', 10, 3 );  
        
        //$this->loader->add_filter('woocommerce_login_redirect', $plugin_public, 'wc_custom_user_redirect', 101, 3);


        /* Multi Vendor */
	    $this->loader->add_action('wp_ajax_mstoreapp-wcmap-vendor-details', $plugin_public, 'get_wcmap_vendor_details');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-wcmap-vendor-details', $plugin_public, 'get_wcmap_vendor_details');

        /* Dokan Vendor */
        $this->loader->add_action('wp_ajax_mstoreapp-vendors-list', $plugin_public, 'get_vendors_list');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-vendors-list', $plugin_public, 'get_vendors_list');

        /* WCFM Multi Vendor */
	    $this->loader->add_action('wp_ajax_mstoreapp-wcfm-vendor-list', $plugin_public, 'get_wcfm_vendor_list');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-wcfm-vendor-list', $plugin_public, 'get_wcfm_vendor_list');

        //---REWARD POINTS--------/
        $this->loader->add_action('wp_ajax_mstoreapp-ajax_maybe_apply_discount', $plugin_public, 'ajax_maybe_apply_discount');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-ajax_maybe_apply_discount', $plugin_public, 'ajax_maybe_apply_discount');
		
		$this->loader->add_action('wp_ajax_mstoreapp-getPointsHistory', $plugin_public, 'getPointsHistory');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-getPointsHistory', $plugin_public, 'getPointsHistory');

        $plugin_multivendor = new Mstoreapp_Mobile_App_Multivendor( $this->get_plugin_name(), $this->get_version() );

        $this->loader->add_filter( 'posts_clauses', $plugin_multivendor, 'mstoreapp_location_filter', 99, 2);

        //For WC Marketplace geo user query
        $this->loader->add_action( 'pre_user_query', $plugin_multivendor, 'geo_location_user_query', 99, 1  );
        $this->loader->add_action( 'pre_get_users', $plugin_multivendor, 'pre_get_users', 99, 1  );

        $this->loader->add_action('wp_ajax_mstoreapp-vendor_reviews', $plugin_multivendor, 'get_vendor_reviews');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-vendor_reviews', $plugin_multivendor, 'get_vendor_reviews');

        $this->loader->add_action('wp_ajax_mstoreapp-vendor_details', $plugin_multivendor, 'get_vendor_details');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-vendor_details', $plugin_multivendor, 'get_vendor_details');

	    $this->loader->add_action('wp_ajax_mstoreapp-vendors', $plugin_multivendor, 'get_vendors');
        $this->loader->add_action('wp_ajax_nopriv_mstoreapp-vendors', $plugin_multivendor, 'get_vendors');

	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Mstoreapp_Mobile_App_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

}

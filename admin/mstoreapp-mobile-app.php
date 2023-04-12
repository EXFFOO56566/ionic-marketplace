<?php


/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              http://mstoreapp.com
 * @since             8.0.0
 * @package           Mstoreapp_Mobile_App
 *
 * @wordpress-plugin
 * Plugin Name:       Mstoreapp Mobile Multivendor
 * Plugin URI:        http://mstoreapp.com
 * Description:       Connects Mstoreapp Marketplace Mobile App with api.
 * Version:           9.0.1
 * Author:            Mstoreapp
 * Author URI:        http://mstoreapp.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       mstoreapp-mobile-wcmarketplace
 * Domain Path:       /languages
 */

        /*error_reporting(E_ALL);
        ini_set('display_errors', 1);*/

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-mstoreapp-mobile-app-activator.php
 */
function activate_mstoreapp_mobile_app() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-mstoreapp-mobile-app-activator.php';
	Mstoreapp_Mobile_App_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-mstoreapp-mobile-app-deactivator.php
 */
function deactivate_mstoreapp_mobile_app() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-mstoreapp-mobile-app-deactivator.php';
	Mstoreapp_Mobile_App_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_mstoreapp_mobile_app' );
register_deactivation_hook( __FILE__, 'deactivate_mstoreapp_mobile_app' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-mstoreapp-mobile-app.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_mstoreapp_mobile_app() {

	$plugin = new Mstoreapp_Mobile_App();
	$plugin->run();

}

run_mstoreapp_mobile_app();

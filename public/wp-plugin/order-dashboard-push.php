<?php
/**
 * Plugin Name: Order Dashboard Push (Direct)
 * Description: Pushes new and updated orders directly to the Next.js Dashboard immediately.
 * Version: 3.0
 * Author: Hamed
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class OrderDashboardPush {

    private $option_name = 'odp_settings';
    private $default_url = 'https://dashboard.pgemshop.com';

    public function __construct() {
        // Admin Menu & Settings
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        
        // PUSH Hooks: Send order from WooCommerce -> Dashboard
        add_action( 'woocommerce_new_order', array( $this, 'push_order_to_dashboard' ), 10, 1 );
        add_action( 'woocommerce_update_order', array( $this, 'push_order_to_dashboard' ), 10, 1 );
        
        // Hook for Order Status Change (specifically)
        add_action( 'woocommerce_order_status_changed', array( $this, 'push_order_to_dashboard' ), 10, 1 );
    }

    // --- Admin UI ---
    public function add_admin_menu() {
        add_options_page(
            'Order Dashboard Push',
            'Dashboard Push',
            'manage_options',
            'order-dashboard-push',
            array( $this, 'create_admin_page' )
        );
    }

    public function register_settings() {
        register_setting( $this->option_name, $this->option_name );
    }

    public function create_admin_page() {
        $options = get_option( $this->option_name );
        $base_url = isset( $options['base_url'] ) ? $options['base_url'] : $this->default_url;
        ?>
        <div class="wrap">
            <h1>Order Dashboard Push Settings</h1>
            <p>This plugin sends order updates to your Next.js Dashboard immediately.</p>
            <form method="post" action="options.php">
                <?php
                settings_fields( $this->option_name );
                do_settings_sections( $this->option_name );
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Dashboard Base URL</th>
                        <td>
                            <input type="text" name="<?php echo $this->option_name; ?>[base_url]" value="<?php echo esc_attr( $base_url ); ?>" style="width: 400px;" />
                            <p class="description">Enter the root URL of your Next.js dashboard (e.g., <?php echo $this->default_url; ?>)</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    // --- Helper: Get Base URL ---
    private function get_base_url() {
        $options = get_option( $this->option_name );
        $url = isset( $options['base_url'] ) ? $options['base_url'] : $this->default_url;
        return rtrim( $url, '/' ); // Remove trailing slash
    }

    // --- PUSH: Send Order from WooCommerce to Dashboard ---
    public function push_order_to_dashboard( $order_id ) {
        // Safety Check: Ensure WooCommerce is active
        if ( ! function_exists( 'wc_get_order' ) ) return;

        $base_url = $this->get_base_url();
        if ( empty( $base_url ) ) return;

        try {
            $order = wc_get_order( $order_id );
            if ( ! $order ) return;

            // Prepare Payload manually to ensure we get everything
            $data = $order->get_data();
            
            // Add Line Items
            $data['line_items'] = array();
            foreach ( $order->get_items() as $item ) {
                $data['line_items'][] = $item->get_data();
            }

            // Add Fee Lines
            $data['fee_lines'] = array();
            foreach ( $order->get_fees() as $item ) {
                $data['fee_lines'][] = $item->get_data();
            }

            // Add Coupon Lines
            $data['coupon_lines'] = array();
            foreach ( $order->get_coupons() as $item ) {
                $data['coupon_lines'][] = $item->get_data();
            }

            // Add Meta Data
            $data['meta_data'] = array();
            foreach ( $order->get_meta_data() as $meta ) {
                $data['meta_data'][] = $meta->get_data();
            }

            // Endpoint
            $endpoint = $base_url . '/api/webhook/woocommerce';

            // Send Request
            wp_remote_post( $endpoint, array(
                'method'    => 'POST',
                'body'      => json_encode( $data ),
                'headers'   => array( 'Content-Type' => 'application/json' ),
                'timeout'   => 5, // Short timeout to not block user
                'sslverify' => false,
                'blocking'  => false // Non-blocking (Fire and Forget)
            ));

        } catch ( Exception $e ) {
            error_log( "ODS Push Error: " . $e->getMessage() );
        }
    }
}

// Initialize
add_action( 'plugins_loaded', function() {
    new OrderDashboardPush();
});

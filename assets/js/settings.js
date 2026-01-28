/**
 * Settings page JavaScript.
 *
 * @package AdminCoachTours
 */

( function( $ ) {
	'use strict';

	/**
	 * Initialize settings page.
	 */
	function init() {
		const $providerSelect = $( '#act_ai_provider' );

		if ( ! $providerSelect.length ) {
			return;
		}

		// Toggle provider fields visibility.
		function toggleProviderFields() {
			const selectedProvider = $providerSelect.val();

			$( '.act-provider-field' ).removeClass( 'act-provider-active' );
			$( '.act-provider-' + selectedProvider ).addClass( 'act-provider-active' );
		}

		// Initial toggle.
		toggleProviderFields();

		// Toggle on change.
		$providerSelect.on( 'change', toggleProviderFields );

		// Confirmation for API key changes.
		$( '#act-settings-form' ).on( 'submit', function( e ) {
			const $apiKeyFields = $( '.act-sensitive-field' );
			let hasChanges = false;

			$apiKeyFields.each( function() {
				if ( $( this ).val().length > 0 ) {
					hasChanges = true;
					return false;
				}
			} );

			if ( hasChanges ) {
				// Allow form submission - API keys will be encrypted server-side.
				return true;
			}

			return true;
		} );
	}

	// Run on DOM ready.
	$( document ).ready( init );

}( jQuery ) );

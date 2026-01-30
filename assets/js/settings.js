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

		// Add provider class to parent table rows for proper hiding.
		$( '.act-provider-field' ).each( function() {
			const $field = $( this );
			const provider = $field.data( 'provider' );
			const $row = $field.closest( 'tr' );

			if ( $row.length && provider ) {
				$row.addClass( 'act-provider-row act-provider-' + provider );
			}
		} );

		// Toggle provider fields visibility.
		function toggleProviderFields() {
			const selectedProvider = $providerSelect.val();

			// Toggle row visibility.
			$( '.act-provider-row' ).removeClass( 'act-provider-active' );
			$( '.act-provider-row.act-provider-' + selectedProvider ).addClass( 'act-provider-active' );

			// Also toggle field divs (fallback).
			$( '.act-provider-field' ).removeClass( 'act-provider-active' );
			$( '.act-provider-' + selectedProvider + '.act-provider-field' ).addClass( 'act-provider-active' );
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

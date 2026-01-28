<?php
/**
 * Encryption Utility.
 *
 * Handles encryption/decryption of sensitive data using libsodium.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

declare( strict_types=1 );

namespace AdminCoachTours\Security;

/**
 * Encryption class.
 */
class Encryption {

	/**
	 * Cache for the encryption key.
	 *
	 * @var string|null
	 */
	private ?string $key_cache = null;

	/**
	 * Get the encryption key.
	 *
	 * @return string 32-byte key.
	 */
	private function get_key(): string {
		if ( null !== $this->key_cache ) {
			return $this->key_cache;
		}

		// Derive key from wp_salt('auth').
		$salt = wp_salt( 'auth' );

		// Use BLAKE2b to derive a 32-byte key.
		$this->key_cache = sodium_crypto_generichash( $salt, '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES );

		return $this->key_cache;
	}

	/**
	 * Encrypt a string.
	 *
	 * @param string $plaintext String to encrypt.
	 * @return string Base64-encoded encrypted string with nonce prefix.
	 */
	public function encrypt( string $plaintext ): string {
		if ( empty( $plaintext ) ) {
			return '';
		}

		$key   = $this->get_key();
		$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );

		$ciphertext = sodium_crypto_secretbox( $plaintext, $nonce, $key );

		// Prepend nonce to ciphertext.
		$combined = $nonce . $ciphertext;

		// Base64 encode for storage.
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
		return base64_encode( $combined );
	}

	/**
	 * Decrypt a string.
	 *
	 * @param string $encrypted Base64-encoded encrypted string.
	 * @return string|null Decrypted string or null on failure.
	 */
	public function decrypt( string $encrypted ): ?string {
		if ( empty( $encrypted ) ) {
			return null;
		}

		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		$combined = base64_decode( $encrypted, true );

		if ( false === $combined ) {
			return null;
		}

		// Check minimum length.
		$min_length = SODIUM_CRYPTO_SECRETBOX_NONCEBYTES + SODIUM_CRYPTO_SECRETBOX_MACBYTES;

		if ( strlen( $combined ) < $min_length ) {
			return null;
		}

		$key = $this->get_key();

		// Extract nonce and ciphertext.
		$nonce      = substr( $combined, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$ciphertext = substr( $combined, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );

		// Decrypt.
		$plaintext = sodium_crypto_secretbox_open( $ciphertext, $nonce, $key );

		if ( false === $plaintext ) {
			return null;
		}

		return $plaintext;
	}

	/**
	 * Check if encryption is available.
	 *
	 * @return bool True if sodium is available.
	 */
	public static function is_available(): bool {
		return extension_loaded( 'sodium' ) || function_exists( 'sodium_crypto_secretbox' );
	}

	/**
	 * Securely wipe sensitive data from memory.
	 *
	 * @param string $data Data to wipe.
	 */
	public function wipe( string &$data ): void {
		if ( function_exists( 'sodium_memzero' ) ) {
			sodium_memzero( $data );
		} else {
			// Fallback: overwrite with zeros.
			$data = str_repeat( "\0", strlen( $data ) );
		}
	}
}

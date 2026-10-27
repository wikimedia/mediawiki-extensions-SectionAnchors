function createSectionAnchorButton( heading ) {
	createStyles();

	const dfd = $.Deferred();
	const modules = [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-editing-core' ];
	mw.loader.using( modules ).done( () => {
		const $heading = $( heading ),
			isLegacyHeading = heading.classList.contains( 'mw-headline' ),
			// Legacy markup: the surrounding h1 ... h6; current markup: the h1 ... h6 itself
			$headingContainer = isLegacyHeading ? $heading.parent() : $heading,
			// If a heading contains special chars an additional span is added (legacy markup only)
			$headingAnchor = isLegacyHeading ? $heading.prev( 'span[id]' ) : $(),
			headingAnchorId = $headingAnchor.attr( 'id' ) || $heading.attr( 'id' ),
			headingText = $heading.text(),
			sectionLinkIconWidget = new OO.ui.IconWidget( {
				label: mw.message( 'sectionanchors-button-tooltip' ).text(),
				icon: 'link',
				classes: [ 'sectionanchors-button' ]
			} ),
			$sectionLink = sectionLinkIconWidget.$element;

		heading.$sectionAnchorButton = $sectionLink;
		$headingContainer.prepend( $sectionLink );
		$sectionLink.data( {
			headingAnchorId: headingAnchorId,
			headingText: headingText
		} );

		$sectionLink.on(
			'click',
			function ( event ) {
				// If no access to the clipboard, we just scroll to the heading
				if ( !navigator.clipboard ) {
					window.location.hash = headingAnchorId;
					return;
				}

				const $me = $( this ),
					headingAnchorText = $me.data( 'headingText' ),
					notifText = mw.message(
						'sectionanchors-button-notification-text',
						[ headingAnchorText ]
					).text(),
					fragment = $me.data( 'headingAnchorId' ),
					isCtrlKey = event.ctrlKey || event.metaKey,
					pageName = mw.config.get( 'wgPageName' );

				// If ctrl+shift is pressed, we copy pagename plus the fragment to the clipboard
				// This can be used for creating an internal wikitext link
				if ( isCtrlKey && event.shiftKey ) {
					navigator.clipboard.writeText(
						pageName + '#' + fragment
					);
					mw.notify( notifText );
					return;
				}

				// In any other case we copy the full url to the clipboard
				mw.loader.using( [ 'mediawiki.Title' ] ).done( () => {
					const oldId = mw.config.get( 'wgRevisionId' ),
						title = mw.Title.newFromText( pageName ),
						params = {};

					title.fragment = fragment;
					if ( oldId !== 0 && isCtrlKey ) {
						params.oldid = oldId;
					}

					const url = mw.config.get( 'wgServer' ) + title.getUrl( params );

					// eslint-disable-next-line compat/compat
					navigator.clipboard.writeText( url );
					mw.notify( notifText );
				} );

			}
		);
	} );
	return dfd.promise();
}

var stylesCreated = false; // eslint-disable-line no-var
function createStyles() {
	if ( stylesCreated ) {
		return;
	}
	stylesCreated = true;
	const styles =
		'.sectionanchors-button {' +
			'position: absolute;' +
			'margin-left: -20px;' +
			'min-width: 16px;' +
			'width: 16px;' +
			'cursor: pointer;' +
			'opacity: 0.5' +
		'}';
	$( '<style>' ).text( styles ).appendTo( 'head' );
}

const headingSelector = [ '.mw-headline' ].concat(
	[ 1, 2, 3, 4, 5, 6 ].map( ( level ) => '.mw-heading > h' + level )
).join( ', ' );

$( document ).on( 'mouseover', headingSelector, function () {
	if ( !this.$sectionAnchorButton ) {
		const me = this;
		createSectionAnchorButton( this ).done( () => {
			me.$sectionAnchorButton.show();
		} );
	} else {
		this.$sectionAnchorButton.show();
	}

} );

$( document ).on( 'mouseover', '.sectionanchors-button', function () {
	$( this ).data( 'isMouseOver', true );
} );

$( document ).on( 'mouseout', '.sectionanchors-button', function () {
	$( this ).data( 'isMouseOver', false );
	$( this ).hide();
} );

$( document ).on( 'mouseout', headingSelector, function () {
	const me = this;
	setTimeout( () => {
		if ( me.$sectionAnchorButton && !me.$sectionAnchorButton.data( 'isMouseOver' ) ) {
			me.$sectionAnchorButton.hide();
		}
	},
	100
	);
} );

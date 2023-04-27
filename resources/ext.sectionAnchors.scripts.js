function createSectionAnchorButton( heading ) {
	createStyles();

	var dfd = $.Deferred();
	var modules = [ 'oojs-ui-widgets', 'oojs-ui.styles.icons-editing-core' ];
	mw.loader.using( modules ).done( function () {
		var $heading = $( heading ),
			// h1, h2, h3, h4, h5, h6
			$headingContainer = $heading.parent(),
			$headingAnchor = $heading.prev( 'span[id]' ),
			// If a heading contains special chars an additional span is added
			headingAnchorId = $headingAnchor.attr( 'id' ) || $heading.attr( 'id' ),
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
			headingText: $heading.text()
		} );

		$sectionLink.on(
			'click',
			function ( event ) {
				// If no access to the clipboard, we just scroll to the heading
				if ( !navigator.clipboard ) {
					window.location.hash = headingAnchorId;
					return;
				}

				var $me = $( this ),
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
				mw.loader.using( [ 'mediawiki.Title' ] ).done( function () {
					var oldId = mw.config.get( 'wgRevisionId' ),
						title = mw.Title.newFromText( pageName ),
						params = {};

					title.fragment = fragment;
					if ( oldId !== 0 && isCtrlKey ) {
						params.oldid = oldId;
					}

					var url = mw.config.get( 'wgServer' ) + title.getUrl( params );

					// eslint-disable-next-line compat/compat
					navigator.clipboard.writeText( url );
					mw.notify( notifText );
				} );

			}
		);
	} );
	return dfd.promise();
}

var stylesCreated = false;
function createStyles() {
	if ( stylesCreated ) {
		return;
	}
	stylesCreated = true;
	var styles =
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

$( document ).on( 'mouseover', '.mw-headline', function () {
	if ( !this.$sectionAnchorButton ) {
		var me = this;
		createSectionAnchorButton( this ).done( function () {
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

$( document ).on( 'mouseout', '.mw-headline', function () {
	var me = this;
	setTimeout( function () {
		if ( me.$sectionAnchorButton && !me.$sectionAnchorButton.data( 'isMouseOver' ) ) {
			me.$sectionAnchorButton.hide();
		}
	},
	100
	);
} );

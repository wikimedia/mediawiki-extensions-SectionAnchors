function createSectionAnchorButton( heading ) {
	var dfd = $.Deferred();
	mw.loader.using( [ 'oojs-ui-widgets' ] ).done( function () {
		var $heading = $( heading ),
			headingOffset = $heading.offset(),
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
		$sectionLink.insertBefore( $headingContainer );
		$sectionLink.css( {
			position: 'absolute',
			top: headingOffset.top + ( ( $heading.height() - $sectionLink.height() ) / 2 ),
			left: headingOffset.left - $sectionLink.width() - 10,
			cursor: 'pointer'
		} );
		$sectionLink.data( {
			headingAnchorId: headingAnchorId,
			headingText: $heading.text()
		} );

		$sectionLink.on(
			'click',
			function ( event ) {
				var $me = $( this );
				if ( event.ctrlKey ) {
					var headingAnchorText = $me.data( 'headingText' );
					var notifText = mw.message(
						'sectionanchors-button-notification-text',
						[ headingAnchorText ]
					).text();
					mw.loader.using( [ 'mediawiki.Title' ] ).done( function () {
						var pageName = mw.config.get( 'wgPageName' ),
							oldId = mw.config.get( 'wgRevisionId' ),
							title = mw.Title.newFromText( pageName );
						title.fragment = $me.data( 'headingAnchorId' );
						var url = title.getUrl( {
							oldid: oldId
						} );

						navigator.clipboard.writeText( url );
						mw.notify( notifText );
					} );
				} else {
					window.location.hash = headingAnchorId;
				}
			}
		);
	} );
	return dfd.promise();
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

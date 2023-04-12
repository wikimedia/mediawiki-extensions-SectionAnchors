<?php

namespace MediaWiki\Extension\SectionAnchors\Tests;

use MediaWiki\Extension\SectionAnchors\Hooks;
use OutputPage;
use Skin;

/**
 * @coversDefaultClass \MediaWiki\Extension\SectionAnchors\Hooks
 */
class HooksTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers ::onBeforePageDisplay
	 */
	public function testOnBeforePageDisplay() {
		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();

		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.sectionAnchors.scripts' );

		$skinMock = $this->getMockBuilder( Skin::class )
			->disableOriginalConstructor()
			->getMock();

		( new Hooks )->onBeforePageDisplay( $outputPageMock, $skinMock );
	}
}

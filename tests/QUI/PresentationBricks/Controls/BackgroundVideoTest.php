<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\BackgroundVideo;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/BackgroundVideo.php';

class BackgroundVideoTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new BackgroundVideo();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertTrue($control->getAttribute('autoplay'));
        $this->assertSame('afterWindowLoad', $control->getAttribute('lazyLoadMode'));
    }

    public function testRendersBody(): void
    {
        $control = new BackgroundVideo([
            'poster' => '',
            'openVideoInPopup' => ''
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
        $this->assertNotSame('', $result);
    }
}

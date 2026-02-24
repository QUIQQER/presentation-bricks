<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\StickyContent;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/StickyContent.php';

class StickyContentTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new StickyContent();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame(5, $control->getAttribute('limit'));
    }
}

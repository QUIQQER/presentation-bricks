<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\CountUpBasic;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/CountUpBasic.php';

class CountUpBasicTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new CountUpBasic();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame('simple', $control->getAttribute('template'));
    }

    public function testRendersBodyWithEntries(): void
    {
        $control = new CountUpBasic([
            'entries' => '[{"title":"A","number":"1"}]'
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
    }
}

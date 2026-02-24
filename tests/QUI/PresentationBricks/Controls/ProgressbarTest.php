<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\Progressbar;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/Progressbar.php';

class ProgressbarTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new Progressbar();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame('top', $control->getAttribute('textPosition'));
    }

    public function testRendersBodyWithConfiguredEntries(): void
    {
        $control = new Progressbar([
            'entries' => '[{"title":"A","percent":150},{"title":"B","percent":20}]',
            'maxWidth' => 900
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
        $this->assertNotSame('', $result);
    }

    public function testRendersBodyWithRightText(): void
    {
        $control = new Progressbar([
            'entries' => '[{"title":"A","percent":10}]',
            'additionalTextRight' => true,
            'textPosition' => ''
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
    }
}

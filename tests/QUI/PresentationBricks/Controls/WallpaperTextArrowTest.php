<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\WallpaperTextArrow;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/WallpaperTextArrow.php';

class WallpaperTextArrowTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new WallpaperTextArrow();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame('arrow-down', $control->getAttribute('arrowType'));
    }

    public function testRendersBody(): void
    {
        $control = new WallpaperTextArrow([
            'arrow-type' => 'hide',
            'image-background' => ''
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
        $this->assertNotSame('', $result);
    }

    public function testRendersBodyWithArrowAndFixedBackground(): void
    {
        $control = new WallpaperTextArrow([
            'arrow-type' => 'arrow-down',
            'image-background-fixed' => true,
            'image-background' => ''
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
    }
}

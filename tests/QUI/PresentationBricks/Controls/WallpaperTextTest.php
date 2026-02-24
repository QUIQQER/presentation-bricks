<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\WallpaperText;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/WallpaperText.php';

class WallpaperTextTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new WallpaperText();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame(600, $control->getAttribute('contentMaxWidth'));
    }

    public function testRendersBody(): void
    {
        $control = new WallpaperText([
            'bg-color' => '#eeeeee',
            'image-background' => '',
            'minHeight' => '200px'
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
        $this->assertNotSame('', $result);
    }
}

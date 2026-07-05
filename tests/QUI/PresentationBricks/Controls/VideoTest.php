<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\Video;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/Video.php';

class VideoTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new Video();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame(50, $control->getAttribute('videoBrightness'));
        $this->assertSame('afterWindowLoad', $control->getAttribute('lazyLoadMode'));
    }

    public function testCheckMaxWidthReturnsExpectedValues(): void
    {
        $control = new Video();
        $method = new \ReflectionMethod($control, 'checkMaxWidth');
        $method->setAccessible(true);

        $this->assertSame('initial', $method->invoke($control, null));
        $this->assertSame('initial', $method->invoke($control, 0));
        $this->assertSame('initial', $method->invoke($control, '0'));
        $this->assertSame('240px', $method->invoke($control, 240));
        $this->assertSame('320px', $method->invoke($control, '320'));
    }

    public function testRendersBody(): void
    {
        $control = new Video([
            'poster' => '',
            'maxVideoWidth' => '640',
            'maxContentWidth' => '1200'
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
        $this->assertNotSame('', $result);
    }
}

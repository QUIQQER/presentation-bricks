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

    public function testImageLoadingSettingAndTemplateVariants(): void
    {
        $packageDir = dirname(__DIR__, 4);
        $Document = new \DOMDocument();

        $this->assertTrue($Document->load($packageDir . '/bricks.xml'));

        $XPath = new \DOMXPath($Document);
        $settings = $XPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\PresentationBricks\\Controls\\WallpaperTextArrow"]' .
            '/settings/setting[@name="imageLoading"]'
        );

        $this->assertNotFalse($settings);
        $this->assertCount(1, $settings);
        $this->assertSame('select', $settings->item(0)?->attributes?->getNamedItem('type')?->nodeValue);
        $this->assertSame('eager', $XPath->evaluate('string(defaultValue)', $settings->item(0)));
        $this->assertSame(
            ['eager', 'lazy'],
            array_map(
                static fn(\DOMNode $option): string => (string)$option->attributes?->getNamedItem('value')?->nodeValue,
                iterator_to_array($XPath->query('option', $settings->item(0)) ?: [])
            )
        );

        $template = file_get_contents(
            $packageDir . '/src/QUI/PresentationBricks/Controls/WallpaperTextArrow.html'
        );

        $this->assertIsString($template);
        $this->assertStringContainsString("{if \$imageLoading == 'eager'}", $template);
        $this->assertStringContainsString('loading="eager" fetchpriority="high"', $template);
        $this->assertStringContainsString('loading="lazy"', $template);
    }

    public function testImageLoadingNormalization(): void
    {
        $Control = new class extends WallpaperTextArrow {
            public function normalizeImageLoadingForTest(mixed $imageLoading): string
            {
                return $this->normalizeImageLoading($imageLoading);
            }
        };

        $this->assertSame('eager', $Control->normalizeImageLoadingForTest('eager'));
        $this->assertSame('lazy', $Control->normalizeImageLoadingForTest('lazy'));
        $this->assertSame('eager', $Control->normalizeImageLoadingForTest('invalid'));
        $this->assertSame('eager', $Control->normalizeImageLoadingForTest(null));
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

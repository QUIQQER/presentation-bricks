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

    public function testImageLoadingSettingAndTemplateVariants(): void
    {
        $packageDir = dirname(__DIR__, 4);
        $Document = new \DOMDocument();

        $this->assertTrue($Document->load($packageDir . '/bricks.xml'));

        $XPath = new \DOMXPath($Document);
        $settings = $XPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\PresentationBricks\\Controls\\WallpaperText"]' .
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
            $packageDir . '/src/QUI/PresentationBricks/Controls/WallpaperText.html'
        );

        $this->assertIsString($template);
        $this->assertStringContainsString("{if \$imageLoading == 'eager'}", $template);
        $this->assertStringContainsString('loading="eager" fetchpriority="high"', $template);
        $this->assertStringContainsString('loading="lazy"', $template);
    }

    public function testImageLoadingNormalization(): void
    {
        $Control = new class extends WallpaperText {
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

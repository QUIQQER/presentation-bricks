<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\ImageCompare;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/ImageCompare.php';

class ImageCompareTest extends TestCase
{
    /**
     * @param array<string, mixed> $attributes
     */
    private function control(array $attributes = []): ImageCompare
    {
        return new ImageCompare($attributes);
    }

    /**
     * A small subclass that exposes the protected logic methods for testing.
     *
     * @param array<string, mixed> $attributes
     */
    private function testable(array $attributes = []): ImageCompare
    {
        return new class ($attributes) extends ImageCompare {
            /**
             * @param array<int, string> $allowed
             */
            public function normalizeForTest(string $attribute, array $allowed): string
            {
                return $this->normalize($attribute, $allowed);
            }

            public function startPositionForTest(): int
            {
                return $this->normalizeStartPosition();
            }

            public function sanitizeCssLengthForTest(string $value): string
            {
                return $this->sanitizeCssLength($value);
            }

            /**
             * @return array{show: bool, text: string, srText: string}
             */
            public function resolveLabelForTest(string $mode, string $text, string $var): array
            {
                return $this->resolveLabel($mode, $text, $var);
            }
        };
    }

    private function brickNode(): \DOMElement
    {
        $document = new \DOMDocument();
        $this->assertTrue($document->load(dirname(__DIR__, 4) . '/bricks.xml'));

        $xPath = new \DOMXPath($document);
        $nodes = $xPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\PresentationBricks\\Controls\\ImageCompare"]'
        );

        $this->assertNotFalse($nodes);
        $this->assertCount(1, $nodes);

        $node = $nodes->item(0);
        $this->assertInstanceOf(\DOMElement::class, $node);

        return $node;
    }

    private function settingNode(string $name): \DOMElement
    {
        $document = new \DOMDocument();
        $this->assertTrue($document->load(dirname(__DIR__, 4) . '/bricks.xml'));

        $xPath = new \DOMXPath($document);
        $nodes = $xPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\PresentationBricks\\Controls\\ImageCompare"]' .
            '/settings/setting[@name="' . $name . '"]'
        );

        $this->assertNotFalse($nodes);
        $this->assertCount(1, $nodes);

        $node = $nodes->item(0);
        $this->assertInstanceOf(\DOMElement::class, $node);

        return $node;
    }

    public function testInstantiatesAsControl(): void
    {
        $this->assertInstanceOf(Control::class, $this->control());
    }

    public function testDefaultAttributes(): void
    {
        $control = $this->control();

        $this->assertSame('horizontal', $control->getAttribute('orientation'));
        $this->assertSame('brand', $control->getAttribute('handleColor'));
        $this->assertSame(50, $control->getAttribute('startPosition'));
        $this->assertSame('', $control->getAttribute('maxWidth'));
        $this->assertTrue((bool)$control->getAttribute('borderRadius'));
        $this->assertTrue((bool)$control->getAttribute('introAnimation'));
    }

    public function testReturnsEmptyBodyWhenBothImagesMissing(): void
    {
        $this->assertSame('', $this->control()->getBody());
    }

    public function testReturnsEmptyBodyWhenOnlyOneImageIsSet(): void
    {
        $this->assertSame('', $this->control(['imageBefore' => 'only-before'])->getBody());
        $this->assertSame('', $this->control(['imageAfter' => 'only-after'])->getBody());
    }

    public function testRendersSliderHandleWithStartPosition(): void
    {
        $body = $this->control([
            'imageBefore' => 'before-placeholder',
            'imageAfter' => 'after-placeholder',
            'startPosition' => 40
        ])->getBody();

        $this->assertStringContainsString('role="slider"', $body);
        $this->assertStringContainsString('aria-valuenow="40"', $body);
    }

    public function testCircleHandleRendersChevrons(): void
    {
        $body = $this->control([
            'imageBefore' => 'a',
            'imageAfter' => 'b',
            'handleStyle' => 'circle'
        ])->getBody();

        $this->assertStringContainsString('imageCompare__knob', $body);
        $this->assertStringContainsString('fa-chevron-left', $body);
    }

    public function testLineHandleRendersGripInsteadOfKnob(): void
    {
        $body = $this->control([
            'imageBefore' => 'a',
            'imageAfter' => 'b',
            'handleStyle' => 'line'
        ])->getBody();

        $this->assertStringContainsString('imageCompare__grip', $body);
        $this->assertStringNotContainsString('imageCompare__knob', $body);
    }

    public function testVerticalOrientationUsesVerticalAriaAndChevrons(): void
    {
        $body = $this->control([
            'imageBefore' => 'a',
            'imageAfter' => 'b',
            'orientation' => 'vertical'
        ])->getBody();

        $this->assertStringContainsString('aria-orientation="vertical"', $body);
        $this->assertStringContainsString('fa-chevron-up', $body);
    }

    public function testHiddenLabelsAreNotRendered(): void
    {
        $body = $this->control([
            'imageBefore' => 'a',
            'imageAfter' => 'b',
            'labelBeforeMode' => 'hidden',
            'labelAfterMode' => 'hidden'
        ])->getBody();

        $this->assertStringNotContainsString('imageCompare__label', $body);
    }

    public function testCustomLabelTextIsRendered(): void
    {
        $body = $this->control([
            'imageBefore' => 'a',
            'imageAfter' => 'b',
            'labelBeforeMode' => 'custom',
            'labelBeforeText' => 'Alt-Zustand'
        ])->getBody();

        $this->assertStringContainsString('Alt-Zustand', $body);
    }

    public function testContentIsRenderedAboveTheComparison(): void
    {
        $body = $this->control([
            'imageBefore' => 'a',
            'imageAfter' => 'b',
            'content' => '<p>Intro</p>'
        ])->getBody();

        $this->assertStringContainsString('control-content', $body);
        $this->assertStringContainsString('<p>Intro</p>', $body);
    }

    public function testNormalizeFallsBackToFirstAllowedValue(): void
    {
        $control = $this->testable(['orientation' => 'diagonal']);

        $this->assertSame(
            'horizontal',
            $control->normalizeForTest('orientation', ['horizontal', 'vertical'])
        );
    }

    public function testNormalizeKeepsAllowedValue(): void
    {
        $control = $this->testable(['handleColor' => 'black']);

        $this->assertSame(
            'black',
            $control->normalizeForTest('handleColor', ['brand', 'white', 'black'])
        );
    }

    public function testStartPositionIsClampedLow(): void
    {
        $this->assertSame(0, $this->testable(['startPosition' => -10])->startPositionForTest());
    }

    public function testStartPositionIsClampedHigh(): void
    {
        $this->assertSame(100, $this->testable(['startPosition' => 150])->startPositionForTest());
    }

    public function testStartPositionKeepsValidValue(): void
    {
        $this->assertSame(42, $this->testable(['startPosition' => 42])->startPositionForTest());
    }

    public function testMaxWidthBareNumberBecomesPixels(): void
    {
        $this->assertSame('600px', $this->testable()->sanitizeCssLengthForTest('600'));
    }

    public function testMaxWidthKeepsValueWithUnit(): void
    {
        $control = $this->testable();

        $this->assertSame('80%', $control->sanitizeCssLengthForTest('80%'));
        $this->assertSame('40rem', $control->sanitizeCssLengthForTest('40rem'));
    }

    public function testMaxWidthRejectsInvalidValue(): void
    {
        $control = $this->testable();

        $this->assertSame('', $control->sanitizeCssLengthForTest(''));
        $this->assertSame('', $control->sanitizeCssLengthForTest('   '));
        $this->assertSame('', $control->sanitizeCssLengthForTest('100px; color: red'));
    }

    public function testResolveLabelHiddenIsNotShown(): void
    {
        $control = $this->testable(['labelBeforeMode' => 'hidden']);

        $result = $control->resolveLabelForTest(
            'labelBeforeMode',
            'labelBeforeText',
            'control.ImageCompare.label.before.default'
        );

        $this->assertFalse($result['show']);
    }

    public function testResolveLabelCustomWithoutTextIsNotShown(): void
    {
        $control = $this->testable([
            'labelBeforeMode' => 'custom',
            'labelBeforeText' => '   '
        ]);

        $result = $control->resolveLabelForTest(
            'labelBeforeMode',
            'labelBeforeText',
            'control.ImageCompare.label.before.default'
        );

        $this->assertFalse($result['show']);
    }

    public function testResolveLabelCustomUsesEnteredText(): void
    {
        $control = $this->testable([
            'labelBeforeMode' => 'custom',
            'labelBeforeText' => 'Vorzustand'
        ]);

        $result = $control->resolveLabelForTest(
            'labelBeforeMode',
            'labelBeforeText',
            'control.ImageCompare.label.before.default'
        );

        $this->assertTrue($result['show']);
        $this->assertSame('Vorzustand', $result['text']);
    }

    public function testResolveLabelDefaultIsShown(): void
    {
        $control = $this->testable(['labelBeforeMode' => 'default']);

        $result = $control->resolveLabelForTest(
            'labelBeforeMode',
            'labelBeforeText',
            'control.ImageCompare.label.before.default'
        );

        $this->assertTrue($result['show']);
        $this->assertSame($result['text'], $result['srText']);
    }

    public function testBrickHasContentEnabled(): void
    {
        $this->assertSame('1', $this->brickNode()->getAttribute('hasContent'));
    }

    public function testRequiredImagesUseMediaImagePicker(): void
    {
        $this->assertSame('media-image', $this->settingNode('imageBefore')->getAttribute('class'));
        $this->assertSame('media-image', $this->settingNode('imageAfter')->getAttribute('class'));
    }

    public function testLabelModeIsWiredToDependencyControl(): void
    {
        $mode = $this->settingNode('labelBeforeMode');
        $text = $this->settingNode('labelBeforeText');

        $this->assertStringContainsString('settings/Dependency', $mode->getAttribute('data-qui'));
        $this->assertSame('labelBeforeMode', $text->getAttribute('data-dependency'));
        $this->assertSame('custom', $text->getAttribute('data-dependency-options'));
    }

    public function testHandleColorOptionsAndDefault(): void
    {
        $setting = $this->settingNode('handleColor');
        $xPath = new \DOMXPath($setting->ownerDocument);

        $values = array_map(
            static fn(\DOMNode $option): string => (string)$option->attributes?->getNamedItem('value')?->nodeValue,
            iterator_to_array($xPath->query('option', $setting) ?: [])
        );

        $this->assertSame(['brand', 'white', 'black'], $values);
        $this->assertSame('brand', $xPath->evaluate('string(defaultValue)', $setting));
    }

    public function testStartPositionSettingBounds(): void
    {
        $setting = $this->settingNode('startPosition');

        $this->assertSame('number', $setting->getAttribute('type'));
        $this->assertSame('0', $setting->getAttribute('min'));
        $this->assertSame('100', $setting->getAttribute('max'));
    }

    public function testMaxWidthSettingIsFreeTextInput(): void
    {
        $this->assertSame('text', $this->settingNode('maxWidth')->getAttribute('type'));
    }

    public function testCssShipsCoreThemingHooks(): void
    {
        $css = file_get_contents(
            dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/ImageCompare.css'
        );

        $this->assertIsString($css);
        $this->assertStringContainsString('@property --_pos', $css);
        $this->assertStringContainsString('--handleColor-white', $css);
        $this->assertStringContainsString('--handleColor-black', $css);
        $this->assertStringContainsString('--_handleSolid', $css);
        $this->assertStringContainsString('.is-loading', $css);
    }

    public function testCssShipsMaxWidthHooks(): void
    {
        $css = file_get_contents(
            dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/ImageCompare.css'
        );

        $this->assertIsString($css);
        $this->assertStringContainsString('--_maxWidth: var(--quiqqer-presentationBricks-imageCompare-maxWidth', $css);
        $this->assertStringContainsString('max-width: var(--_maxWidth)', $css);
        $this->assertStringContainsString('margin-inline: auto', $css);
    }

    public function testJavaScriptShipsInteractionHooks(): void
    {
        $js = file_get_contents(
            dirname(__DIR__, 4) . '/bin/Controls/ImageCompare.js'
        );

        $this->assertIsString($js);
        $this->assertStringContainsString('IntersectionObserver', $js);
        $this->assertStringContainsString('is-loading', $js);
        $this->assertStringContainsString('introanimation', $js);
    }

    public function testTemplateShipsEagerLoadingAndSlider(): void
    {
        $template = file_get_contents(
            dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/ImageCompare.html'
        );

        $this->assertIsString($template);
        $this->assertStringContainsString('loading="eager" fetchpriority="high"', $template);
        $this->assertStringContainsString('role="slider"', $template);
    }
}

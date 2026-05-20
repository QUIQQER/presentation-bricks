<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Control;
use QUI\PresentationBricks\Controls\Counter;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/Counter.php';
require_once __DIR__ . '/CounterTestControl.php';

class CounterTest extends TestCase
{
    public function testCanBeInstantiatedWithDefaults(): void
    {
        $control = new Counter();

        $this->assertInstanceOf(Control::class, $control);
        $this->assertSame('stacked-center', $control->getAttribute('template'));
        $this->assertSame(2500, $control->getAttribute('duration'));
    }

    public function testInvalidEntriesFallbackToEmptyList(): void
    {
        $control = new CounterTestControl([
            'entries' => 'invalid'
        ]);

        $this->assertSame([], $control->normalizedEntries());
    }

    public function testDisabledEntriesAreRemoved(): void
    {
        $control = new CounterTestControl([
            'entries' => [
                [
                    'title' => 'A',
                    'disabled' => true
                ],
                [
                    'title' => 'B',
                    'startValue' => 1,
                    'endValue' => 2
                ]
            ]
        ]);

        $entries = $control->normalizedEntries();

        $this->assertCount(1, $entries);
        $this->assertSame('B', $entries[0]['title']);
    }

    public function testStartAndEndValuesAreNormalized(): void
    {
        $control = new CounterTestControl([
            'entries' => [
                [
                    'startValue' => '10,5',
                    'endValue' => '20',
                    'numberAddon' => 'k',
                    'title' => 'A'
                ]
            ]
        ]);

        $entries = $control->normalizedEntries();

        $this->assertSame(10.5, $entries[0]['startValue']);
        $this->assertSame(20, $entries[0]['endValue']);
        $this->assertSame('k', $entries[0]['numberAddon']);
    }

    public function testInvalidTemplateFallsBackToStackedCenter(): void
    {
        $control = new CounterTestControl([
            'template' => 'unknown'
        ]);

        $this->assertSame('vertical', $control->templateName());
        $this->assertSame('stacked-center', $control->templateVariant());
    }

    public function testTemplateVariantMapsToVerticalTemplateAndModifierClasses(): void
    {
        $control = new CounterTestControl([
            'template' => 'inline-left'
        ]);

        $this->assertSame('vertical', $control->templateName());
        $this->assertSame('inline-left', $control->templateVariant());
        $this->assertSame(
            'quiqqer-presentationBricks-counter--layout-inline quiqqer-presentationBricks-counter--align-left',
            $control->layoutModifierClasses()
        );
    }

    public function testHorizontalTemplateDoesNotAddAlignmentModifier(): void
    {
        $control = new CounterTestControl([
            'template' => 'horizontal'
        ]);

        $this->assertSame('horizontal', $control->templateName());
        $this->assertSame('horizontal', $control->templateVariant());
        $this->assertSame(
            'quiqqer-presentationBricks-counter--layout-horizontal',
            $control->layoutModifierClasses()
        );
    }

    public function testInvalidGapPresetFallsBackToNormal(): void
    {
        $control = new CounterTestControl([
            'gap' => '99px'
        ]);

        $this->assertSame('clamp(1rem, 0.9rem + 0.5vw, 1.5rem)', $control->gapPresetValue());
    }

    public function testInvalidNumberSizePresetFallsBackToNormal(): void
    {
        $control = new CounterTestControl([
            'numberSize' => '4rem'
        ]);

        $this->assertSame('clamp(1.5rem, 1.1rem + 1.8vw, 3rem)', $control->numberSizePresetValue());
    }

    public function testRendersControlAndEntryTitlesWithNeutralMarkup(): void
    {
        $control = new Counter([
            'showTitle' => true,
            'frontendTitle' => 'Kennzahlen',
            'entries' => [[
                'title' => 'Projekte',
                'startValue' => 0,
                'endValue' => 12,
                'numberAddon' => 'k',
                'suffix' => '+'
            ]]
        ]);

        $result = $control->getBody();

        $this->assertStringContainsString('<h2 class="control-header">Kennzahlen</h2>', $result);
        $this->assertStringContainsString('<div class="quiqqer-presentationBricks-counter__title">Projekte</div>', $result);
        $this->assertStringContainsString('<span class="quiqqer-presentationBricks-counter__numberAddon">k</span>', $result);
        $this->assertStringContainsString('<span class="quiqqer-presentationBricks-counter__suffix">+</span>', $result);
    }
}

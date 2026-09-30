<?php

namespace QUITests\PresentationBricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\PresentationBricks\Controls\ScrollPinnedCards;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/ScrollPinnedCards.php';

class ScrollPinnedCardsTest extends TestCase
{
    public function testCardGapChoicesMatchTheEditorAndRejectUnknownValues(): void
    {
        $document = new \DOMDocument();
        $this->assertTrue($document->load(dirname(__DIR__, 4) . '/bricks.xml'));
        $xpath = new \DOMXPath($document);
        $setting = '/quiqqer/bricks/brick[@control="\\QUI\\PresentationBricks\\Controls\\ScrollPinnedCards"]'
            . '/settings/setting[@name="cardGap"]';
        $options = $xpath->query($setting . '/option');
        $this->assertNotFalse($options);
        $this->assertSame('normal', trim($xpath->evaluate('string(' . $setting . '/defaultValue)')));

        $presets = [
            'small' => 'clamp(1rem, 2cqi, 1.5rem)',
            'normal' => 'clamp(1.5rem, 3.5cqi, 3rem)',
            'large' => 'clamp(2rem, 5cqi, 4.5rem)'
        ];
        $this->assertSame(array_keys($presets), array_map(
            static fn (\DOMElement $option): string => $option->getAttribute('value'),
            iterator_to_array($options)
        ));

        foreach ($presets + ['unknown' => $presets['normal'], '' => $presets['normal']] as $value => $expected) {
            $control = new ScrollPinnedCards(['cardGap' => $value, 'entries' => [['title' => 'Card']]]);
            $this->assertStringContainsString('--_q-controlConf-cardGap:' . $expected, $control->create());
        }

        $control = new ScrollPinnedCards(['entries' => [['title' => 'Card']]]);
        $this->assertStringContainsString('--_q-controlConf-cardGap:' . $presets['normal'], $control->create());
    }

    public function testHiddenCounterStillProvidesSliderNavigation(): void
    {
        $control = new ScrollPinnedCards([
            'counterMode' => 'hidden',
            'entries' => [
                ['title' => 'First'],
                ['title' => 'Second']
            ]
        ]);

        $html = $control->create();

        $this->assertStringNotContainsString('data-name="counter"', $html);
        $this->assertStringContainsString('data-name="prev"', $html);
        $this->assertStringContainsString('data-name="next"', $html);
        $this->assertStringContainsString('data-qui-options-breakpoint="768"', $html);
        $this->assertStringContainsString('/Carousel.css', implode('\n', $control->getCSSFiles()));
    }

    public function testDisabledCardsDoNotEnablePinningOrIncreaseTheCounter(): void
    {
        $control = new ScrollPinnedCards([
            'entries' => [
                ['title' => 'Visible'],
                ['title' => 'Disabled card', 'disabled' => true]
            ]
        ]);

        $html = $control->getBody();

        $this->assertSame(1, substr_count($html, 'data-name="card"'));
        $this->assertStringNotContainsString('Disabled card', $html);
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('__counterTotal">01</span>', $html);
    }

    public function testCustomCounterTargetAndEscapedCardTitlesSurviveRendering(): void
    {
        $control = new ScrollPinnedCards([
            'counterMode' => 'custom',
            'counterTarget' => 'package-navigation',
            'content' => '<div data-name="package-navigation"></div>',
            'entries' => [
                ['title' => '<First>'],
                ['title' => 'Second']
            ]
        ]);

        $html = $control->create();

        $this->assertStringContainsString('data-qui-options-countertarget="package-navigation"', $html);
        $this->assertStringContainsString('data-name="navigation"', $html);
        $this->assertStringContainsString('data-name="counter"', $html);
        $this->assertStringContainsString('&lt;First&gt;', $html);
        $this->assertSame(2, substr_count($html, 'data-name="card"'));
    }
}

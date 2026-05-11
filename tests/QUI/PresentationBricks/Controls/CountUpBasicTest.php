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
        $this->assertSame(
            'quiqqer-presentationBricks-countUpBasic',
            $control->getAttribute('class')
        );
    }

    public function testRendersBodyWithEntries(): void
    {
        $control = new CountUpBasic([
            'entries' => '[{"title":"A","counterValue":"1"}]'
        ]);

        $result = $control->getBody();

        $this->assertIsString($result);
    }

    public function testFilterDisabledEntriesRemovesDisabledItems(): void
    {
        $control = new class extends CountUpBasic {
            public function filterEntries(array $entries): array
            {
                return $this->filterDisabledEntries($entries);
            }
        };

        $result = $control->filterEntries([
            [
                'title' => 'Visible',
                'counterValue' => '10'
            ],
            [
                'title' => 'Hidden',
                'counterValue' => '20',
                'disabled' => 1
            ],
            [
                'title' => 'Also visible',
                'counterValue' => '30',
                'disabled' => 0
            ]
        ]);

        $this->assertCount(2, $result);
        $this->assertSame('Visible', $result[0]['title']);
        $this->assertSame('Also visible', $result[1]['title']);
    }
}

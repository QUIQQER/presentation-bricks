<?php

namespace QUITests\PresentationBricks\Controls;

use QUI\PresentationBricks\Controls\Counter;

require_once dirname(__DIR__, 4) . '/src/QUI/PresentationBricks/Controls/Counter.php';

class CounterTestControl extends Counter
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function normalizedEntries(): array
    {
        return $this->getNormalizedEntries();
    }

    public function templateName(): string
    {
        return $this->getTemplateName();
    }

    public function templateVariant(): string
    {
        return $this->getTemplateVariant();
    }

    public function layoutModifierClasses(): string
    {
        return $this->getLayoutModifierClasses();
    }

    public function gapPresetValue(): string
    {
        return $this->getGapPresetValue();
    }

    public function numberSizePresetValue(): string
    {
        return $this->getNumberSizePresetValue();
    }
}

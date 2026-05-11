<?php

/**
 * This file contains \QUI\PresentationBricks\Controls\Progressbar
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class Progressbar
 *
 * @author  Dominik Chrzanowski
 * @package quiqqer/presentation-bricks
 */
class Progressbar extends QUI\Control
{
    private const TEXT_COLUMN_MAP = [
        '25/75' => '1fr 3fr',
        '33/67' => '1fr 2fr',
        '40/60' => '2fr 3fr',
        '50/50' => '1fr 1fr',
        '60/40' => '3fr 2fr',
        '67/33' => '2fr 1fr',
        '75/25' => '3fr 1fr',
    ];

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'additionalText' => '',
            'entries' => '',
            'textPosition' => 'top',
            'textColumnWidth' => '50/50',
            'verticalAlign' => 'center',
            'mobileTextPosition' => 'top',
            'maxWidth' => '',
            'containerMaxWidth' => '',
            'barLayout' => 'default',
            'animation' => 'none'
        ]);

        $this->addCSSFile(dirname(__FILE__) . '/Progressbar.css');

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $entries = json_decode((string) $this->getAttribute('entries'), true);
        if (!is_array($entries)) {
            $entries = [];
        }

        $additionalText = (string) $this->getAttribute('additionalText');

        $textPosition = $this->normalizeTextPosition((string) $this->getAttribute('textPosition'));
        $mobileTextPosition = in_array($this->getAttribute('mobileTextPosition'), ['top', 'bottom'], true)
            ? $this->getAttribute('mobileTextPosition')
            : 'top';

        $textColumnKey = (string) $this->getAttribute('textColumnWidth');
        if (!isset(self::TEXT_COLUMN_MAP[$textColumnKey])) {
            $textColumnKey = '50/50';
        }
        $textColumns = self::TEXT_COLUMN_MAP[$textColumnKey];

        $verticalAlignMap = ['top' => 'start', 'center' => 'center', 'bottom' => 'end'];
        $verticalAlignKey = (string) $this->getAttribute('verticalAlign');
        if (!isset($verticalAlignMap[$verticalAlignKey])) {
            $verticalAlignKey = 'top';
        }
        $verticalAlign = $verticalAlignMap[$verticalAlignKey];

        $barLayout = in_array($this->getAttribute('barLayout'), ['default', 'wide', 'overlay'], true)
            ? $this->getAttribute('barLayout')
            : 'default';

        $animation = in_array($this->getAttribute('animation'), ['none', 'once', 'scroll'], true)
            ? $this->getAttribute('animation')
            : 'none';

        $barsMaxWidth = $this->sanitizeCssLength((string) $this->getAttribute('maxWidth'));
        $containerMaxWidth = $this->sanitizeCssLength((string) $this->getAttribute('containerMaxWidth'));

        if ($animation === 'once') {
            $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/Progressbar');
        }

        $progressbarData = [];
        $index = 0;
        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            if (!empty($entry['isDisabled'])) {
                continue;
            }

            $percent = isset($entry['percent']) ? (int) $entry['percent'] : 0;
            $percent = max(0, min(100, $percent));

            $color = '';
            if (
                !empty($entry['setColor'])
                && !empty($entry['color'])
                && is_string($entry['color'])
                && preg_match('/^#[0-9A-Fa-f]{3,8}$/', $entry['color']) === 1
            ) {
                $color = $entry['color'];
            }

            $progressbarData[] = [
                'index' => $index++,
                'title' => isset($entry['title']) ? (string) $entry['title'] : '',
                'percent' => $percent,
                'color' => $color,
            ];
        }

        if ($barsMaxWidth !== '') {
            $this->setCustomVariable('bars-maxWidth', $barsMaxWidth);
        }
        if ($containerMaxWidth !== '') {
            $this->setCustomVariable('container-maxWidth', $containerMaxWidth);
        }

        if ($additionalText === '') {
            $this->setCustomVariable('areas', '"bars"');
            $this->setCustomVariable('areas-mobile', '"bars"');
        } else {
            $areasMap = [
                'top'    => '"text" "bars"',
                'bottom' => '"bars" "text"',
                'left'   => '"text bars"',
                'right'  => '"bars text"',
            ];
            $this->setCustomVariable('areas', $areasMap[$textPosition]);

            $areasMobileMap = [
                'top'    => '"text" "bars"',
                'bottom' => '"bars" "text"',
            ];
            $this->setCustomVariable('areas-mobile', $areasMobileMap[$mobileTextPosition]);

            if ($textPosition === 'left' || $textPosition === 'right') {
                $this->setCustomVariable('cols', $textColumns);
                $this->setCustomVariable('valign', $verticalAlign);
            }
        }

        $Engine->assign([
            'this' => $this,
            'additionalText' => $additionalText,
            'progressbarData' => $progressbarData,
            'barLayout' => $barLayout,
            'animation' => $animation,
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Progressbar.html');
    }

    private function normalizeTextPosition(string $value): string
    {
        return in_array($value, ['top', 'bottom', 'left', 'right'], true) ? $value : 'top';
    }

    /**
     * Whitelist-style sanitizer for CSS length values.
     * Allows numbers with optional CSS unit (px, rem, vw, %, ch, …) or a bare number (treated as px).
     * Returns the cleaned value or an empty string if input is invalid.
     */
    private function sanitizeCssLength(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?[a-zA-Z%]*$/', $value) !== 1) {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?$/', $value) === 1) {
            return $value . 'px';
        }

        return $value;
    }

    private function setCustomVariable(string $name, string $value): void
    {
        if ($name === '' || $value === '') {
            return;
        }

        $this->setStyle('--_q-controlConf-' . $name, $value);
    }
}

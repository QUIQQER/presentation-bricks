<?php

/**
 * This file contains QUI\PresentationBricks\Controls\ImageCompare
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class ImageCompare
 *
 * Before/after image comparison with a draggable handle. Two congruent images
 * are stacked, the overlay is clipped via clip-path, and a handle on the
 * dividing line reveals one image over the other.
 *
 * @package quiqqer/presentation-bricks
 */
class ImageCompare extends QUI\Control
{
    protected const ORIENTATIONS = ['horizontal', 'vertical'];

    protected const LABEL_POSITIONS = ['top', 'center', 'bottom'];

    protected const LABEL_STYLES = ['box', 'pill', 'plain'];

    protected const LABEL_MODES = ['default', 'custom', 'hidden'];

    protected const HANDLE_STYLES = ['circle', 'line'];

    protected const HANDLE_COLORS = ['brand', 'white', 'black'];

    protected const ASPECT_RATIOS = [
        'auto' => '',
        '16:9' => '16 / 9',
        '4:3' => '4 / 3',
        '1:1' => '1 / 1'
    ];

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-presentationBricks-imageCompare',
            'imageBefore' => '',
            'imageAfter' => '',
            'labelBeforeMode' => 'default',
            'labelBeforeText' => '',
            'labelAfterMode' => 'default',
            'labelAfterText' => '',
            'labelPosition' => 'top',
            'labelStyle' => 'box',
            'handleStyle' => 'circle',
            'handleColor' => 'brand',
            'orientation' => 'horizontal',
            'startPosition' => 50,
            'aspectRatio' => 'auto',
            'maxWidth' => '',
            'borderRadius' => true,
            'introAnimation' => true
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(dirname(__FILE__) . '/ImageCompare.css');
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $imageBefore = trim((string)$this->getAttribute('imageBefore'));
        $imageAfter = trim((string)$this->getAttribute('imageAfter'));

        if ($imageBefore === '' || $imageAfter === '') {
            QUI\System\Log::addWarning(
                'ImageCompare brick is missing imageBefore and/or imageAfter, nothing rendered.',
                ['brickId' => $this->getAttribute('id')]
            );

            return '';
        }

        $Engine = QUI::getTemplateManager()->getEngine();

        $orientation = $this->normalize('orientation', self::ORIENTATIONS);
        $labelPosition = $this->normalize('labelPosition', self::LABEL_POSITIONS);
        $labelStyle = $this->normalize('labelStyle', self::LABEL_STYLES);
        $handleStyle = $this->normalize('handleStyle', self::HANDLE_STYLES);
        $handleColor = $this->normalize('handleColor', self::HANDLE_COLORS);
        $startPosition = $this->normalizeStartPosition();

        $this->addCSSClass('quiqqer-presentationBricks-imageCompare--' . $orientation);
        $this->addCSSClass('quiqqer-presentationBricks-imageCompare--label-' . $labelStyle);
        $this->addCSSClass('quiqqer-presentationBricks-imageCompare--labelpos-' . $labelPosition);
        $this->addCSSClass('quiqqer-presentationBricks-imageCompare--handle-' . $handleStyle);
        $this->addCSSClass('quiqqer-presentationBricks-imageCompare--handleColor-' . $handleColor);

        if ($this->getAttribute('borderRadius')) {
            $this->addCSSClass('quiqqer-presentationBricks-imageCompare--rounded');
        }

        $aspectRatioValue = self::ASPECT_RATIOS[(string)$this->getAttribute('aspectRatio')] ?? '';

        if ($aspectRatioValue !== '') {
            $this->addCSSClass('quiqqer-presentationBricks-imageCompare--ratio-fixed');
            $this->setCustomVariable('aspectRatio', $aspectRatioValue);
        }

        $maxWidth = $this->sanitizeCssLength((string)$this->getAttribute('maxWidth'));

        if ($maxWidth !== '') {
            $this->setCustomVariable('maxWidth', $maxWidth);
        }

        $this->setCustomVariable('pos', $startPosition . '%');

        $before = $this->resolveLabel('labelBeforeMode', 'labelBeforeText', 'control.ImageCompare.label.before.default');
        $after = $this->resolveLabel('labelAfterMode', 'labelAfterText', 'control.ImageCompare.label.after.default');

        $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/ImageCompare');
        $this->setJavaScriptControlOption('orientation', $orientation);
        $this->setJavaScriptControlOption('startposition', $startPosition);
        $this->setJavaScriptControlOption('srbefore', $before['srText']);
        $this->setJavaScriptControlOption('srafter', $after['srText']);
        $this->setJavaScriptControlOption('introanimation', (int)$this->getAttribute('introAnimation'));

        $Engine->assign([
            'this' => $this,
            'imageBefore' => $imageBefore,
            'imageAfter' => $imageAfter,
            'orientation' => $orientation,
            'handleStyle' => $handleStyle,
            'startPosition' => $startPosition,
            'showBeforeLabel' => $before['show'],
            'beforeLabel' => $before['text'],
            'showAfterLabel' => $after['show'],
            'afterLabel' => $after['text'],
            'sliderLabel' => QUI::getLocale()->get(
                'quiqqer/presentation-bricks',
                'control.ImageCompare.slider.ariaLabel'
            )
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/ImageCompare.html');
    }

    /**
     * Return an attribute value only if it is part of the allowed list,
     * otherwise fall back to the first allowed value.
     *
     * @param string $attribute
     * @param array<int, string> $allowed
     *
     * @return string
     */
    protected function normalize(string $attribute, array $allowed): string
    {
        $value = (string)$this->getAttribute($attribute);

        if (in_array($value, $allowed, true)) {
            return $value;
        }

        return $allowed[0];
    }

    /**
     * Clamp the start position to an integer between 0 and 100.
     *
     * @return int
     */
    protected function normalizeStartPosition(): int
    {
        $value = (int)$this->getAttribute('startPosition');

        return max(0, min(100, $value));
    }

    /**
     * Sanitize a user-entered CSS length. A bare number becomes pixels, values
     * with a unit (px, %, rem, …) are kept, anything else returns an empty
     * string so the CSS fallback (100%) applies.
     *
     * @param string $value
     *
     * @return string
     */
    protected function sanitizeCssLength(string $value): string
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

    /**
     * Resolve a label into its display text and whether it should be shown.
     *
     * - hidden           -> not shown
     * - custom, empty    -> not shown
     * - custom, filled   -> the entered text
     * - default / unset  -> the localized default text
     *
     * "srText" is always filled (default text as fallback) so the slider can
     * announce which side is currently revealed, even with hidden labels.
     *
     * @param string $modeAttribute
     * @param string $textAttribute
     * @param string $defaultLocaleVar
     *
     * @return array{show: bool, text: string, srText: string}
     */
    protected function resolveLabel(string $modeAttribute, string $textAttribute, string $defaultLocaleVar): array
    {
        $default = QUI::getLocale()->get('quiqqer/presentation-bricks', $defaultLocaleVar);
        $mode = $this->normalize($modeAttribute, self::LABEL_MODES);

        if ($mode === 'hidden') {
            return ['show' => false, 'text' => '', 'srText' => $default];
        }

        if ($mode === 'custom') {
            $text = trim((string)$this->getAttribute($textAttribute));

            if ($text === '') {
                return ['show' => false, 'text' => '', 'srText' => $default];
            }

            return ['show' => true, 'text' => $text, 'srText' => $text];
        }

        return ['show' => true, 'text' => $default, 'srText' => $default];
    }

    /**
     * Write a control config CSS variable to the root element style. The CSS
     * picks it up via the long, themeable variable as a fallback layer.
     *
     * @param string $name
     * @param string $value
     *
     * @return void
     */
    private function setCustomVariable(string $name, string $value): void
    {
        if ($name === '' || $value === '') {
            return;
        }

        $this->setStyle('--_q-controlConf-' . $name, $value);
    }
}

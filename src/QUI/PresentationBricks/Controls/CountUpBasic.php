<?php

/**
 * This file contains QUI\PresentationBricks\Controls\CountUpBasic
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class StickyContent
 *
 * @package quiqqer/presentation-bricks
 */
class CountUpBasic extends QUI\Control
{
    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'class' => 'quiqqer-presentationBricks-countUpBasic',
            'entries' => [],
            'iconTop' => false,
            'template' => 'simple'
        ]);

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
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        if (!is_array($entries)) {
            $entries = [];
        }

        $entries = $this->filterDisabledEntries($entries);

        $template = $this->getAttribute('template');

        switch ($template) {
            case 'simple':
            default:
                $html = dirname(__FILE__) . '/CountUpBasic.Simple.html';
                $css = dirname(__FILE__) . '/CountUpBasic.Simple.css';
                break;
        }

        $Engine->assign([
            'this' => $this,
            'entries' => $entries,
            'iconTop' => $this->getAttribute('iconTop')
        ]);

        $this->addCSSFile($css);

        return $Engine->fetch($html);
    }

    /**
     * @param array<int|string, mixed> $entries
     * @return array<int, mixed>
     */
    protected function filterDisabledEntries(array $entries): array
    {
        return array_values(array_filter($entries, function ($entry) {
            if (!is_array($entry) || !isset($entry['disabled'])) {
                return true;
            }

            return !in_array($entry['disabled'], [true, 1, '1'], true);
        }));
    }
}

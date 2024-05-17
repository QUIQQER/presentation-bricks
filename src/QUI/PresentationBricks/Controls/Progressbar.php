<?php

/**
 * This file contains \QUI\PresentationBricks\Controls\Progressbar
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class Author
 *
 * @author  Dominik Chrzanowski
 * @package quiqqer/bricks
 */
class Progressbar extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'additionalText' => '',
            'progressbarData' => [],
            'textOnRight' => false,
            'maxWidth' => '', //in pixels
            'textPosition' => 'top'
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
        $entries = json_decode($this->getAttribute('entries'), true);

        $additionalText = $this->getAttribute('additionalText');
        $maxWidth = '1920px';
        $textOnRight = 'quiqqer-progressbar__textLeft';
        $progressbarData = [];
        $textPosition = '';

        if ($this->getAttribute('textPosition')) {
            $textPosition = $this->getAttribute('textPosition');
        }

        if ($this->getAttribute('additionalTextRight')) {
            $textOnRight = 'quiqqer-progressbar__textRight';
        }

        if (
            $this->getAttribute('maxWidth') > 0 &&
            $this->getAttribute('maxWidth') <= 1920
        ) {
            $maxWidth = $this->getAttribute('maxWidth') . 'px';
        }

        foreach ($entries as $entry) {
            if ($entry['percent'] > 100) {
                $entry['percent'] = 100;
            }

            $progressbarData[] = [
                'title' => $entry['title'],
                "percent" => $entry['percent']
            ];
        }

        $Engine->assign([
            'this' => $this,
            'additionalText' => $additionalText,
            'progressbarData' => $progressbarData,
            'textOnRight' => $textOnRight,
            'maxWidth' => $maxWidth,
            'textPosition' => $textPosition
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Progressbar.html');
    }
}

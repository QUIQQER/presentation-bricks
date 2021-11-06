<?php

/**
 * This file contains \QUI\PresentationBricks\Controls\Progressbar
 */

namespace QUI\PresentationBricks\Controls;

use QUI;
use QUI\Exception;

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
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'class'    => 'quiqqer-blog-control-author',
            'template' => 'largeImageTop' // template
        ]);

        $this->addCSSFile(dirname(__FILE__) . '/Progressbar.css');

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine  = QUI::getTemplateManager()->getEngine();
        $entries = json_decode($this->getAttribute('entries'), true);

        $content         = $this->getAttribute('progressbarContent');
        $maxWidth        = '1920px';
        $textPosition    = 'quiqqer-progressbar__textLeft';
        $progressbarData = [];

        if ($this->getAttribute('textRight')) {
            $textPosition = 'quiqqer-progressbar__textRight';
        }

        if ($this->getAttribute('maxWidth') > 0 &&
            $this->getAttribute('maxWidth') <= 1920) {
            $maxWidth = $this->getAttribute('maxWidth') . 'px';
        }

        foreach ($entries as $entry) {
            \array_push($progressbarData, ['title' => $entry['title'], "percent" => $entry['percent']]);
        }

        $Engine->assign([
            'this'            => $this,
            'content'         => $content,
            'progressbarData' => $progressbarData,
            'textPosition'    => $textPosition,
            'maxWidth'        => $maxWidth
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Progressbar.html');
    }
}

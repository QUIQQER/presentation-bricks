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

        $content     = $this->getAttribute('progressbarContent');
        $progressbarData = [];

        echo $content;

        foreach ($entries as $entry) {
            \array_push($progressbarData, ['title' => $entry['title'], "percent" => $entry['percent']]);
        }

        var_dump($this->getAttribute('textRight'));

        $Engine->assign([
            'this'        => $this,
            'content'     => $content,
            'progressbarData' => $progressbarData
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Progressbar.html');
    }
}

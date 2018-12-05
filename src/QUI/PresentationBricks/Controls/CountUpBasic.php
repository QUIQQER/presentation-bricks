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
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'class'    => 'qui-control-countUpBasic',
            'entries'  => array(),
            'iconTop'  => false,
            'template' => 'simple'
        ));

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
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $template = $this->getAttribute('template');

        switch ($template) {
            case 'simple':
            default:
                $html = dirname(__FILE__) . '/CountUpBasic.Simple.html';
                $css  = dirname(__FILE__) . '/CountUpBasic.Simple.css';
                break;
        }

        $Engine->assign(array(
            'this'    => $this,
            'entries' => $entries,
            'iconTop'  => $this->getAttribute('iconTop')
        ));

        $this->addCSSFile($css);

        return $Engine->fetch($html);
    }
}
